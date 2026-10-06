import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
};

export const providerProfiles = pgTable('provider_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  displayName: varchar('display_name', { length: 120 }).notNull(),
  avatarUrl: text('avatar_url'),
  tagline: varchar('tagline', { length: 240 }).notNull(),
  bio: text('bio').notNull(),
  serviceDirections: jsonb('service_directions').$type<string[]>().notNull(),
  skills: jsonb('skills').$type<string[]>().notNull(),
  process: jsonb('process').$type<string[]>().notNull(),
  contactCta: varchar('contact_cta', { length: 240 }).notNull(),
  ...timestamps,
});

export const profiles = providerProfiles;

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    name: varchar('name', { length: 160 }).notNull(),
    category: varchar('category', { length: 120 }).notNull(),
    summary: varchar('summary', { length: 500 }).notNull(),
    suitableFor: jsonb('suitable_for').$type<string[]>().notNull(),
    scope: jsonb('scope').$type<string[]>().notNull(),
    delivery: jsonb('delivery').$type<string[]>().notNull(),
    durationLabel: varchar('duration_label', { length: 120 }).notNull(),
    priceLabel: varchar('price_label', { length: 160 }).notNull(),
    faqs: jsonb('faqs')
      .$type<Array<{ question: string; answer: string }>>()
      .notNull(),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    ...timestamps,
  },
  (table) => [index('services_status_idx').on(table.status)],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    name: varchar('name', { length: 160 }).notNull(),
    subtitle: varchar('subtitle', { length: 240 }),
    coverUrl: text('cover_url').notNull(),
    summary: varchar('summary', { length: 800 }).notNull(),
    projectType: varchar('project_type', { length: 120 }).notNull(),
    tags: jsonb('tags').$type<string[]>().notNull(),
    background: text('background').notNull(),
    contribution: text('contribution').notNull(),
    solution: text('solution').notNull(),
    techStack: jsonb('tech_stack').$type<string[]>().notNull(),
    outcomes: jsonb('outcomes').$type<string[]>().notNull(),
    media: jsonb('media')
      .$type<Array<{ url: string; alt: string }>>()
      .notNull(),
    demoUrl: text('demo_url'),
    repositoryUrl: text('repository_url'),
    acceptsSimilarInquiry: boolean('accepts_similar_inquiry')
      .notNull()
      .default(false),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    ...timestamps,
  },
  (table) => [index('projects_status_idx').on(table.status)],
);

export const projectServices = pgTable(
  'project_services',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.serviceId] })],
);

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contactName: varchar('contact_name', { length: 120 }).notNull(),
    contactValue: varchar('contact_value', { length: 320 }).notNull(),
    contactMethod: varchar('contact_method', { length: 20 }).notNull(),
    title: varchar('title', { length: 240 }).notNull(),
    description: text('description').notNull(),
    expectedDate: varchar('expected_date', { length: 80 }),
    budgetLabel: varchar('budget_label', { length: 160 }),
    sourceServiceId: uuid('source_service_id').references(() => services.id, {
      onDelete: 'set null',
    }),
    sourceProjectId: uuid('source_project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    referenceUrl: text('reference_url'),
    attachmentIds: jsonb('attachment_ids')
      .$type<string[]>()
      .notNull()
      .default([]),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    ...timestamps,
  },
  (table) => [
    index('inquiries_status_created_at_idx').on(table.status, table.createdAt),
  ],
);

export const inquiryNotes = pgTable('inquiry_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  inquiryId: uuid('inquiry_id')
    .notNull()
    .references(() => inquiries.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  authorId: varchar('author_id', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: varchar('actor_id', { length: 120 }).notNull(),
  action: varchar('action', { length: 160 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type Profile = ProviderProfile;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type InquiryNote = typeof inquiryNotes.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
