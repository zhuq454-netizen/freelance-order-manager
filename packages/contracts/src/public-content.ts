import { z } from 'zod';

export const contentStatusSchema = z.enum(['draft', 'published', 'archived']);
export const inquiryStatusSchema = z.enum([
  'new',
  'viewed',
  'communicating',
  'quoted',
  'won',
  'rejected',
  'paused',
  'lost',
]);

const trimmedString = (max: number) => z.string().trim().min(1).max(max);
const optionalTrimmedString = (max: number) => trimmedString(max).optional();

export const publicProfileSchema = z.object({
  displayName: trimmedString(120),
  avatarUrl: z.url().optional(),
  tagline: trimmedString(240),
  bio: trimmedString(4000),
  serviceDirections: z.array(trimmedString(120)).max(20),
  skills: z.array(trimmedString(80)).max(40),
  process: z.array(trimmedString(500)).max(12),
  contactCta: trimmedString(240),
});

const publicServiceBaseSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: trimmedString(160),
  category: trimmedString(120),
  summary: trimmedString(500),
  suitableFor: z.array(trimmedString(300)).max(20),
  delivery: z.array(trimmedString(300)).max(20),
  durationLabel: trimmedString(120),
  priceLabel: trimmedString(160),
});

export const publicServiceSummarySchema = publicServiceBaseSchema;
export const publicServiceDetailSchema = publicServiceBaseSchema.extend({
  scope: z.array(trimmedString(500)).max(30),
  faqs: z.array(z.object({
    question: trimmedString(300),
    answer: trimmedString(1000),
  })).max(30),
  relatedProjectSlugs: z.array(z.string().trim().min(1).max(120)).max(30),
});

const publicProjectBaseSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: trimmedString(160),
  subtitle: optionalTrimmedString(240),
  coverUrl: z.url(),
  summary: trimmedString(800),
  projectType: trimmedString(120),
  tags: z.array(trimmedString(80)).max(30),
  updatedAt: z.iso.datetime(),
});

export const publicProjectSummarySchema = publicProjectBaseSchema;
export const publicProjectDetailSchema = publicProjectBaseSchema.extend({
  background: trimmedString(3000),
  contribution: trimmedString(3000),
  solution: trimmedString(5000),
  techStack: z.array(trimmedString(100)).max(40),
  outcomes: z.array(trimmedString(500)).max(30),
  media: z.array(z.object({ url: z.url(), alt: trimmedString(240) })).max(50),
  demoUrl: z.url().optional(),
  repositoryUrl: z.url().optional(),
  acceptsSimilarInquiry: z.boolean(),
  relatedServiceSlugs: z.array(z.string().trim().min(1).max(120)).max(30),
});

export const createInquiryInputSchema = z.object({
  contactName: trimmedString(120),
  contactValue: trimmedString(320),
  contactMethod: z.enum(['email', 'phone', 'wechat', 'other']),
  title: trimmedString(240),
  description: trimmedString(5000),
  expectedDate: optionalTrimmedString(80),
  budgetLabel: optionalTrimmedString(160),
  serviceSlug: optionalTrimmedString(120),
  projectSlug: optionalTrimmedString(120),
  referenceUrl: z.url().optional(),
  attachmentIds: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
  consent: z.literal(true),
});

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type PublicServiceSummary = z.infer<typeof publicServiceSummarySchema>;
export type PublicServiceDetail = z.infer<typeof publicServiceDetailSchema>;
export type PublicProjectSummary = z.infer<typeof publicProjectSummarySchema>;
export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>;
export type CreateInquiryInput = z.infer<typeof createInquiryInputSchema>;
