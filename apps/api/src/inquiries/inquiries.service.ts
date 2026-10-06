import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import {
  createInquiryNoteInputSchema,
  updateInquiryStatusInputSchema,
  type AdminInquiryDetail,
  type AdminInquirySummary,
  type InquiryStatus,
} from '@orderlydesk/contracts';

import { DatabaseService } from '../database/database.module.js';
import {
  auditEvents,
  inquiries,
  inquiryNotes,
  projects,
  services,
} from '../database/schema.js';

@Injectable()
export class InquiriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async list(): Promise<AdminInquirySummary[]> {
    const database = this.requireDatabase();
    const rows = await database
      .select({
        inquiry: inquiries,
        sourceServiceSlug: services.slug,
        sourceProjectSlug: projects.slug,
      })
      .from(inquiries)
      .leftJoin(services, eq(inquiries.sourceServiceId, services.id))
      .leftJoin(projects, eq(inquiries.sourceProjectId, projects.id))
      .orderBy(desc(inquiries.createdAt));

    return rows.map(({ inquiry, sourceServiceSlug, sourceProjectSlug }) =>
      this.toSummary(inquiry, sourceServiceSlug, sourceProjectSlug),
    );
  }

  async get(id: string): Promise<AdminInquiryDetail> {
    const database = this.requireDatabase();
    const row = await this.findRow(id);
    const notes = await database
      .select()
      .from(inquiryNotes)
      .where(
        and(eq(inquiryNotes.inquiryId, id), isNull(inquiryNotes.archivedAt)),
      )
      .orderBy(desc(inquiryNotes.createdAt));

    return this.toDetail(
      row.inquiry,
      row.sourceServiceSlug,
      row.sourceProjectSlug,
      notes,
    );
  }

  async updateStatus(id: string, input: unknown): Promise<AdminInquiryDetail> {
    const parsed = updateInquiryStatusInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({
        message: '需求状态不正确。',
        issues: parsed.error.issues,
      });
    }

    const database = this.requireDatabase();
    const current = await this.findRow(id);
    const [updated] = await database
      .update(inquiries)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();

    if (!updated) throw new NotFoundException('需求不存在。');

    await database.insert(auditEvents).values({
      actorId: 'admin',
      action: 'inquiry.status.updated',
      entityType: 'inquiry',
      entityId: id,
      metadata: { from: current.inquiry.status, to: parsed.data.status },
    });

    return this.get(id);
  }

  async addNote(id: string, input: unknown): Promise<AdminInquiryDetail> {
    const parsed = createInquiryNoteInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({
        message: '备注内容不能为空。',
        issues: parsed.error.issues,
      });
    }

    const database = this.requireDatabase();
    await this.findRow(id);
    await database.insert(inquiryNotes).values({
      inquiryId: id,
      content: parsed.data.content,
      authorId: 'admin',
    });
    await database.insert(auditEvents).values({
      actorId: 'admin',
      action: 'inquiry.note.created',
      entityType: 'inquiry',
      entityId: id,
    });

    return this.get(id);
  }

  private async findRow(id: string) {
    const database = this.requireDatabase();
    const [row] = await database
      .select({
        inquiry: inquiries,
        sourceServiceSlug: services.slug,
        sourceProjectSlug: projects.slug,
      })
      .from(inquiries)
      .leftJoin(services, eq(inquiries.sourceServiceId, services.id))
      .leftJoin(projects, eq(inquiries.sourceProjectId, projects.id))
      .where(eq(inquiries.id, id))
      .limit(1);

    if (!row) throw new NotFoundException('需求不存在。');
    return row;
  }

  private requireDatabase() {
    try {
      return this.databaseService.requireDatabase();
    } catch {
      throw new ServiceUnavailableException('数据库暂不可用，请稍后重试。');
    }
  }

  private toSummary(
    inquiry: typeof inquiries.$inferSelect,
    sourceServiceSlug: string | null,
    sourceProjectSlug: string | null,
  ): AdminInquirySummary {
    return {
      id: inquiry.id,
      contactName: inquiry.contactName,
      contactMethod:
        inquiry.contactMethod as AdminInquirySummary['contactMethod'],
      title: inquiry.title,
      status: inquiry.status as InquiryStatus,
      ...(sourceServiceSlug ? { sourceServiceSlug } : {}),
      ...(sourceProjectSlug ? { sourceProjectSlug } : {}),
      createdAt: inquiry.createdAt.toISOString(),
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  }

  private toDetail(
    inquiry: typeof inquiries.$inferSelect,
    sourceServiceSlug: string | null,
    sourceProjectSlug: string | null,
    notes: Array<typeof inquiryNotes.$inferSelect>,
  ): AdminInquiryDetail {
    return {
      ...this.toSummary(inquiry, sourceServiceSlug, sourceProjectSlug),
      contactValue: inquiry.contactValue,
      description: inquiry.description,
      ...(inquiry.expectedDate ? { expectedDate: inquiry.expectedDate } : {}),
      ...(inquiry.budgetLabel ? { budgetLabel: inquiry.budgetLabel } : {}),
      ...(inquiry.referenceUrl ? { referenceUrl: inquiry.referenceUrl } : {}),
      attachmentIds: inquiry.attachmentIds,
      consentAt: inquiry.consentAt.toISOString(),
      notes: notes.map((note) => ({
        id: note.id,
        content: note.content,
        authorId: note.authorId,
        createdAt: note.createdAt.toISOString(),
      })),
    };
  }
}
