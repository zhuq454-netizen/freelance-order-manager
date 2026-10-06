import { fixtureContent } from './fixtures';
import type { InquiryInput, PublicContent } from '../types';

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) throw new Error(`Public API request failed: ${response.status}`);
  return (await response.json()) as T;
};

export const loadPublicContent = async (): Promise<PublicContent> => {
  try {
    const content = await requestJson<PublicContent>('/public/content');
    if (!content?.profile || !Array.isArray(content.services) || !Array.isArray(content.projects)) {
      throw new Error('Public API returned an invalid content shape');
    }
    return content;
  } catch {
    return fixtureContent;
  }
};

export const submitInquiry = async (input: InquiryInput): Promise<void> => {
  await requestJson('/public/inquiries', { method: 'POST', body: JSON.stringify(input) });
};
