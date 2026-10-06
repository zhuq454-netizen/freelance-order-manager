export interface PublicProfile {
  displayName: string;
  tagline: string;
  bio: string;
  serviceDirections: string[];
  skills: string[];
  process: string[];
  contactCta: string;
}

export interface PublicService {
  slug: string;
  name: string;
  category: string;
  summary: string;
  suitableFor: string[];
  delivery: string[];
  durationLabel: string;
  priceLabel: string;
  scope: string[];
  faqs: { question: string; answer: string }[];
  relatedProjectSlugs: string[];
}

export interface PublicProject {
  slug: string;
  name: string;
  subtitle?: string;
  coverUrl: string;
  summary: string;
  projectType: string;
  tags: string[];
  updatedAt: string;
  background: string;
  contribution: string;
  solution: string;
  techStack: string[];
  outcomes: string[];
  media: { url: string; alt: string }[];
  demoUrl?: string;
  repositoryUrl?: string;
  acceptsSimilarInquiry: boolean;
  relatedServiceSlugs: string[];
  isExample?: boolean;
}

export interface PublicContent {
  profile: PublicProfile;
  services: PublicService[];
  projects: PublicProject[];
}

export interface InquiryInput {
  contactName: string;
  contactValue: string;
  contactMethod: 'email' | 'phone' | 'wechat' | 'other';
  title: string;
  description: string;
  expectedDate?: string | undefined;
  budgetLabel?: string | undefined;
  serviceSlug?: string | undefined;
  projectSlug?: string | undefined;
  referenceUrl?: string | undefined;
  consent: boolean;
}
