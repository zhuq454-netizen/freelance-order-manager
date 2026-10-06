import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { contentStatusSchema } from '@orderlydesk/contracts';

import { DatabaseService } from '../database/database.module.js';
import {
  auditEvents,
  projects,
  providerProfiles,
  services,
} from '../database/schema.js';

const contentDraftSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  bio: z.string().trim().min(1).max(4000),
  contactCta: z.string().trim().min(1).max(240),
  services: z.array(
    z.object({
      slug: z.string().trim().min(1).max(120),
      name: z.string().trim().min(1).max(160),
      summary: z.string().trim().min(1).max(500),
      status: contentStatusSchema,
    }),
  ),
  projects: z.array(
    z.object({
      slug: z.string().trim().min(1).max(120),
      name: z.string().trim().min(1).max(160),
      summary: z.string().trim().min(1).max(800),
      status: contentStatusSchema,
    }),
  ),
  updatedAt: z.string().datetime().optional(),
});

export type ContentDraft = z.infer<typeof contentDraftSchema> & {
  updatedAt: string;
};

@Injectable()
export class ContentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDraft(): Promise<ContentDraft> {
    const database = this.requireDatabase();
    const [profile] = await database
      .select()
      .from(providerProfiles)
      .where(isNull(providerProfiles.archivedAt))
      .limit(1);
    if (!profile) throw new NotFoundException('个人资料不存在。');

    const [serviceRows, projectRows] = await Promise.all([
      database.select().from(services).where(isNull(services.archivedAt)),
      database.select().from(projects).where(isNull(projects.archivedAt)),
    ]);

    return {
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      contactCta: profile.contactCta,
      services: serviceRows.map((service) => ({
        slug: service.slug,
        name: service.name,
        summary: service.summary,
        status: service.status as ContentDraft['services'][number]['status'],
      })),
      projects: projectRows.map((project) => ({
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        status: project.status as ContentDraft['projects'][number]['status'],
      })),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  async updateDraft(input: unknown): Promise<ContentDraft> {
    const parsed = contentDraftSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({
        message: '内容草稿格式不正确。',
        issues: parsed.error.issues,
      });
    }

    const database = this.requireDatabase();
    const [profile] = await database
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(isNull(providerProfiles.archivedAt))
      .limit(1);
    if (!profile) throw new NotFoundException('个人资料不存在。');

    const updatedAt = new Date();
    await database
      .update(providerProfiles)
      .set({
        displayName: parsed.data.displayName,
        tagline: parsed.data.tagline,
        bio: parsed.data.bio,
        contactCta: parsed.data.contactCta,
        updatedAt,
      })
      .where(eq(providerProfiles.id, profile.id));

    for (const service of parsed.data.services) {
      const result = await database
        .update(services)
        .set({ status: service.status, updatedAt })
        .where(eq(services.slug, service.slug))
        .returning({ id: services.id });
      if (!result[0])
        throw new NotFoundException(`服务不存在：${service.slug}`);
    }

    for (const project of parsed.data.projects) {
      const result = await database
        .update(projects)
        .set({ status: project.status, updatedAt })
        .where(eq(projects.slug, project.slug))
        .returning({ id: projects.id });
      if (!result[0])
        throw new NotFoundException(`项目不存在：${project.slug}`);
    }

    await database.insert(auditEvents).values({
      actorId: 'admin',
      action: 'content.draft.updated',
      entityType: 'provider_profile',
      entityId: profile.id,
      metadata: {
        services: parsed.data.services.length,
        projects: parsed.data.projects.length,
      },
    });

    return this.getDraft();
  }

  async publish(): Promise<{ ok: boolean; message: string }> {
    const database = this.requireDatabase();
    const [publishedService] = await database
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.status, 'published'), isNull(services.archivedAt)))
      .limit(1);
    const [publishedProject] = await database
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.status, 'published'), isNull(projects.archivedAt)))
      .limit(1);

    if (!publishedService || !publishedProject) {
      return {
        ok: false,
        message: '发布前还需要补充：至少发布一项服务和一个项目。',
      };
    }

    await database.insert(auditEvents).values({
      actorId: 'admin',
      action: 'content.published',
      entityType: 'public_content',
      metadata: {
        publishedServiceId: publishedService.id,
        publishedProjectId: publishedProject.id,
      },
    });

    return { ok: true, message: '内容已发布。' };
  }

  private requireDatabase() {
    try {
      return this.databaseService.requireDatabase();
    } catch {
      throw new ServiceUnavailableException('数据库暂不可用，请稍后重试。');
    }
  }
}
