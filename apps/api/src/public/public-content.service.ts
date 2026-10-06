import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type {
  PublicProfile,
  PublicProjectDetail,
  PublicServiceDetail,
  PublicServiceSummary,
} from '@orderlydesk/contracts';
import { createInquiryInputSchema } from '@orderlydesk/contracts';

import { DatabaseService } from '../database/database.module.js';
import {
  inquiries,
  projectServices,
  projects,
  providerProfiles,
  services,
} from '../database/schema.js';

export interface PublicContent {
  profile: PublicProfile;
  services: PublicServiceDetail[];
  projects: PublicProjectDetail[];
}

export interface PublicInquiryReceipt {
  id: string;
  status: 'new';
  createdAt: string;
}

@Injectable()
export class PublicContentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getContent(): Promise<PublicContent> {
    const [profile, serviceRows, projectRows] = await Promise.all([
      this.getProfile(),
      this.listServices(),
      this.listProjects(),
    ]);

    return { profile, services: serviceRows, projects: projectRows };
  }

  async getProfile(): Promise<PublicProfile> {
    const database = this.requireDatabase();
    const [profile] = await database
      .select()
      .from(providerProfiles)
      .where(isNull(providerProfiles.archivedAt))
      .limit(1);

    if (!profile) throw new NotFoundException('公开资料不存在。');

    return {
      displayName: profile.displayName,
      ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
      tagline: profile.tagline,
      bio: profile.bio,
      serviceDirections: profile.serviceDirections,
      skills: profile.skills,
      process: profile.process,
      contactCta: profile.contactCta,
    };
  }

  async listServices(): Promise<PublicServiceDetail[]> {
    const database = this.requireDatabase();
    const rows = await database
      .select()
      .from(services)
      .where(and(eq(services.status, 'published'), isNull(services.archivedAt)))
      .orderBy(services.createdAt);

    return Promise.all(rows.map((service) => this.mapService(service)));
  }

  async getService(slug: string): Promise<PublicServiceDetail> {
    const database = this.requireDatabase();
    const [service] = await database
      .select()
      .from(services)
      .where(
        and(
          eq(services.slug, slug),
          eq(services.status, 'published'),
          isNull(services.archivedAt),
        ),
      )
      .limit(1);

    if (!service) throw new NotFoundException('公开服务不存在。');
    return this.mapService(service);
  }

  async listProjects(): Promise<PublicProjectDetail[]> {
    const database = this.requireDatabase();
    const rows = await database
      .select()
      .from(projects)
      .where(and(eq(projects.status, 'published'), isNull(projects.archivedAt)))
      .orderBy(projects.createdAt);

    return Promise.all(rows.map((project) => this.mapProject(project)));
  }

  async getProject(slug: string): Promise<PublicProjectDetail> {
    const database = this.requireDatabase();
    const [project] = await database
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.status, 'published'),
          isNull(projects.archivedAt),
        ),
      )
      .limit(1);

    if (!project) throw new NotFoundException('公开项目不存在。');
    return this.mapProject(project);
  }

  async createInquiry(input: unknown): Promise<PublicInquiryReceipt> {
    const parsed = createInquiryInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({
        message: '需求信息不完整或格式不正确。',
        issues: parsed.error.issues,
      });
    }

    const data = parsed.data;
    const database = this.requireDatabase();
    const sourceServiceId = data.serviceSlug
      ? await this.resolveServiceId(data.serviceSlug)
      : null;
    const sourceProjectId = data.projectSlug
      ? await this.resolveProjectId(data.projectSlug)
      : null;
    const [inquiry] = await database
      .insert(inquiries)
      .values({
        contactName: data.contactName,
        contactValue: data.contactValue,
        contactMethod: data.contactMethod,
        title: data.title,
        description: data.description,
        expectedDate: data.expectedDate,
        budgetLabel: data.budgetLabel,
        sourceServiceId,
        sourceProjectId,
        referenceUrl: data.referenceUrl,
        attachmentIds: data.attachmentIds ?? [],
        consentAt: new Date(),
        status: 'new',
      })
      .returning({
        id: inquiries.id,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
      });

    if (!inquiry)
      throw new ServiceUnavailableException('需求暂时无法保存，请稍后重试。');

    return {
      id: inquiry.id,
      status: 'new',
      createdAt: inquiry.createdAt.toISOString(),
    };
  }

  private requireDatabase() {
    try {
      return this.databaseService.requireDatabase();
    } catch {
      throw new ServiceUnavailableException('数据库暂不可用，请稍后重试。');
    }
  }

  private async resolveServiceId(slug: string): Promise<string> {
    const database = this.requireDatabase();
    const [service] = await database
      .select({ id: services.id })
      .from(services)
      .where(
        and(
          eq(services.slug, slug),
          eq(services.status, 'published'),
          isNull(services.archivedAt),
        ),
      )
      .limit(1);
    if (!service) throw new NotFoundException('关联服务不存在。');
    return service.id;
  }

  private async resolveProjectId(slug: string): Promise<string> {
    const database = this.requireDatabase();
    const [project] = await database
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.status, 'published'),
          isNull(projects.archivedAt),
        ),
      )
      .limit(1);
    if (!project) throw new NotFoundException('关联项目不存在。');
    return project.id;
  }

  private async mapService(
    service: typeof services.$inferSelect,
  ): Promise<PublicServiceDetail> {
    const database = this.requireDatabase();
    const relatedProjects = await database
      .select({ slug: projects.slug })
      .from(projectServices)
      .innerJoin(projects, eq(projectServices.projectId, projects.id))
      .where(
        and(
          eq(projectServices.serviceId, service.id),
          eq(projects.status, 'published'),
          isNull(projects.archivedAt),
        ),
      );

    return {
      slug: service.slug,
      name: service.name,
      category: service.category,
      summary: service.summary,
      suitableFor: service.suitableFor,
      delivery: service.delivery,
      durationLabel: service.durationLabel,
      priceLabel: service.priceLabel,
      scope: service.scope,
      faqs: service.faqs,
      relatedProjectSlugs: relatedProjects.map((project) => project.slug),
    } satisfies PublicServiceSummary & PublicServiceDetail;
  }

  private async mapProject(
    project: typeof projects.$inferSelect,
  ): Promise<PublicProjectDetail> {
    const database = this.requireDatabase();
    const relatedServices = await database
      .select({ slug: services.slug })
      .from(projectServices)
      .innerJoin(services, eq(projectServices.serviceId, services.id))
      .where(
        and(
          eq(projectServices.projectId, project.id),
          eq(services.status, 'published'),
          isNull(services.archivedAt),
        ),
      );

    return {
      slug: project.slug,
      name: project.name,
      ...(project.subtitle ? { subtitle: project.subtitle } : {}),
      coverUrl: project.coverUrl,
      summary: project.summary,
      projectType: project.projectType,
      tags: project.tags,
      updatedAt: project.updatedAt.toISOString(),
      background: project.background,
      contribution: project.contribution,
      solution: project.solution,
      techStack: project.techStack,
      outcomes: project.outcomes,
      media: project.media,
      ...(project.demoUrl ? { demoUrl: project.demoUrl } : {}),
      ...(project.repositoryUrl
        ? { repositoryUrl: project.repositoryUrl }
        : {}),
      acceptsSimilarInquiry: project.acceptsSimilarInquiry,
      relatedServiceSlugs: relatedServices.map((service) => service.slug),
    };
  }
}
