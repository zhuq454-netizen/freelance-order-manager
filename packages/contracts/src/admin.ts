import { z } from 'zod';

import { contentStatusSchema, inquiryStatusSchema, type InquiryStatus } from './public-content.js';

const trimmedString = (max: number) => z.string().trim().min(1).max(max);

export const adminInquirySummarySchema = z.object({
  id: z.uuid(),
  contactName: trimmedString(120),
  contactMethod: z.enum(['email', 'phone', 'wechat', 'other']),
  title: trimmedString(240),
  status: inquiryStatusSchema,
  sourceServiceSlug: z.string().min(1).optional(),
  sourceProjectSlug: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const adminInquiryDetailSchema = adminInquirySummarySchema.extend({
  contactValue: trimmedString(320),
  description: trimmedString(5000),
  expectedDate: z.string().min(1).optional(),
  budgetLabel: z.string().min(1).optional(),
  referenceUrl: z.url().optional(),
  attachmentIds: z.array(z.string().min(1)).max(10),
  consentAt: z.iso.datetime(),
  notes: z.array(z.object({
    id: z.uuid(),
    content: trimmedString(4000),
    authorId: trimmedString(120),
    createdAt: z.iso.datetime(),
  })),
});

export const updateInquiryStatusInputSchema = z.object({ status: inquiryStatusSchema });
export const createInquiryNoteInputSchema = z.object({ content: trimmedString(4000) });

export const adminProfileInputSchema = z.object({
  displayName: trimmedString(120),
  avatarUrl: z.url().optional(),
  tagline: trimmedString(240),
  bio: trimmedString(4000),
  serviceDirections: z.array(trimmedString(120)).max(20),
  skills: z.array(trimmedString(80)).max(40),
  process: z.array(trimmedString(500)).max(12),
  contactCta: trimmedString(240),
});

export const adminServiceInputSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: trimmedString(160),
  category: trimmedString(120),
  summary: trimmedString(500),
  scope: z.array(trimmedString(500)).max(30),
  delivery: z.array(trimmedString(300)).max(20),
  durationLabel: trimmedString(120),
  priceLabel: trimmedString(160),
  faqs: z.array(z.object({ question: trimmedString(300), answer: trimmedString(1000) })).max(30),
  status: contentStatusSchema.default('draft'),
});

export const adminProjectInputSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: trimmedString(160),
  subtitle: z.string().trim().max(240).optional(),
  coverUrl: z.url(),
  summary: trimmedString(800),
  projectType: trimmedString(120),
  tags: z.array(trimmedString(80)).max(30),
  background: trimmedString(3000),
  contribution: trimmedString(3000),
  solution: trimmedString(5000),
  techStack: z.array(trimmedString(100)).max(40),
  outcomes: z.array(trimmedString(500)).max(30),
  demoUrl: z.url().optional(),
  repositoryUrl: z.url().optional(),
  acceptsSimilarInquiry: z.boolean(),
  status: contentStatusSchema.default('draft'),
});

export type AdminInquirySummary = z.infer<typeof adminInquirySummarySchema>;
export type AdminInquiryDetail = z.infer<typeof adminInquiryDetailSchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusInputSchema>;
export type CreateInquiryNoteInput = z.infer<typeof createInquiryNoteInputSchema>;
export type AdminProfileInput = z.infer<typeof adminProfileInputSchema>;
export type AdminServiceInput = z.infer<typeof adminServiceInputSchema>;
export type AdminProjectInput = z.infer<typeof adminProjectInputSchema>;
export type AdminInquiryStatus = InquiryStatus;
