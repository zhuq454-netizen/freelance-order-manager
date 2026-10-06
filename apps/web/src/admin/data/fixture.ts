export type InquiryStatus =
  | 'new'
  | 'viewed'
  | 'communicating'
  | 'quoted'
  | 'won'
  | 'rejected'
  | 'paused'
  | 'lost';

export interface InquiryNote {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface InquirySummary {
  id: string;
  contactName: string;
  contactMethod: 'email' | 'phone' | 'wechat' | 'other';
  title: string;
  status: InquiryStatus;
  sourceServiceSlug?: string;
  sourceProjectSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDetail extends InquirySummary {
  contactValue: string;
  description: string;
  expectedDate?: string;
  budgetLabel?: string;
  referenceUrl?: string;
  attachmentIds: string[];
  consentAt: string;
  notes: InquiryNote[];
}

export interface ContentDraft {
  displayName: string;
  tagline: string;
  bio: string;
  contactCta: string;
  services: Array<{ slug: string; name: string; summary: string; status: 'draft' | 'published' | 'archived' }>;
  projects: Array<{ slug: string; name: string; summary: string; status: 'draft' | 'published' | 'archived' }>;
  updatedAt: string;
}

const fixtureInquiries: InquiryDetail[] = [
  {
    id: 'inquiry-001',
    contactName: '林先生',
    contactMethod: 'email',
    contactValue: 'lin@example.com',
    title: '新品发布影像',
    description: '需要一支清晰、有节奏的发布视频，覆盖发布会现场、产品细节和社交媒体短版切片。',
    expectedDate: '2026-11-20',
    budgetLabel: '¥30,000 - ¥50,000',
    sourceServiceSlug: 'brand-film',
    sourceProjectSlug: 'atlas-launch',
    referenceUrl: 'https://example.com/brief',
    attachmentIds: ['brief-001'],
    consentAt: '2026-10-01T08:20:00.000Z',
    status: 'new',
    createdAt: '2026-10-01T08:20:00.000Z',
    updatedAt: '2026-10-01T08:20:00.000Z',
    notes: [],
  },
  {
    id: 'inquiry-002',
    contactName: '周女士',
    contactMethod: 'wechat',
    contactValue: 'zhou_studio',
    title: '品牌官网内容梳理',
    description: '希望重新整理品牌故事、服务目录和案例呈现，让潜在客户更快理解合作方式。',
    expectedDate: '2026-12-05',
    budgetLabel: '¥15,000 - ¥30,000',
    sourceServiceSlug: 'content-structure',
    attachmentIds: [],
    consentAt: '2026-09-29T03:10:00.000Z',
    status: 'communicating',
    createdAt: '2026-09-29T03:10:00.000Z',
    updatedAt: '2026-09-30T06:40:00.000Z',
    notes: [{ id: 'note-001', content: '已发送首轮沟通问题清单。', authorId: 'admin', createdAt: '2026-09-30T06:40:00.000Z' }],
  },
  {
    id: 'inquiry-003',
    contactName: '陈先生',
    contactMethod: 'phone',
    contactValue: '138****0288',
    title: '展览空间记录片',
    description: '需要记录展览搭建过程与开幕现场，用于后续招商和品牌存档。',
    expectedDate: '2027-01-12',
    budgetLabel: '待沟通',
    sourceProjectSlug: 'north-gallery',
    attachmentIds: [],
    consentAt: '2026-09-24T11:30:00.000Z',
    status: 'quoted',
    createdAt: '2026-09-24T11:30:00.000Z',
    updatedAt: '2026-09-28T09:15:00.000Z',
    notes: [],
  },
];

const inquiries = structuredClone(fixtureInquiries);

const fixtureContent: ContentDraft = {
  displayName: 'Jia Fang',
  tagline: '把复杂需求，整理成可交付的结果。',
  bio: '独立创作者，专注品牌影像、内容结构与数字体验。',
  contactCta: '聊聊你的下一步',
  services: [
    { slug: 'brand-film', name: '品牌影像', summary: '从创意到成片，建立更清晰的品牌表达。', status: 'published' },
    { slug: 'content-structure', name: '内容结构', summary: '梳理信息层级，让内容更容易被理解。', status: 'draft' },
  ],
  projects: [
    { slug: 'atlas-launch', name: 'Atlas 发布计划', summary: '用一套有节奏的内容系统支撑新品发布。', status: 'published' },
    { slug: 'north-gallery', name: 'North Gallery', summary: '记录空间、作品与人与场所的关系。', status: 'draft' },
  ],
  updatedAt: '2026-10-01T12:00:00.000Z',
};

export const DEMO_ADMIN_TOKEN = 'fixture-admin-token';
const DEMO_CONTENT_STORAGE_KEY = 'orderlydesk-admin-content-draft';

export class AdminApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

const cloneContent = (content: ContentDraft): ContentDraft => JSON.parse(JSON.stringify(content)) as ContentDraft;

const readDemoContent = (): ContentDraft => {
  if (typeof window === 'undefined') return cloneContent(fixtureContent);
  const stored = window.localStorage.getItem(DEMO_CONTENT_STORAGE_KEY);
  if (!stored) return cloneContent(fixtureContent);
  try {
    return JSON.parse(stored) as ContentDraft;
  } catch {
    window.localStorage.removeItem(DEMO_CONTENT_STORAGE_KEY);
    return cloneContent(fixtureContent);
  }
};

const writeDemoContent = (content: ContentDraft): ContentDraft => {
  const next = { ...cloneContent(content), updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEMO_CONTENT_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
};

const requestJson = async <T>(path: string, token: string, init: RequestInit = {}): Promise<T> => {
  if (typeof fetch !== 'function') throw new AdminApiError('后台 API 不可用，请稍后重试。');
  try {
    const response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    });
    if (!response.ok) {
      const message = response.status === 401
        ? '后台 API 请求失败：未授权，请检查访问令牌。'
        : `后台 API 请求失败（${response.status}）。`;
      throw new AdminApiError(message, response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AdminApiError) throw error;
    throw new AdminApiError('后台 API 请求失败，请检查网络后重试。');
  }
};

const isDemoToken = (token: string): boolean => token === DEMO_ADMIN_TOKEN;

const requireRemote = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  if (isDemoToken(token)) throw new AdminApiError('演示令牌不能调用真实后台 API。');
  return requestJson<T>(path, token, init);
};

export const adminApi = {
  isDemoToken,
  async verifyToken(token: string): Promise<void> {
    if (isDemoToken(token)) return;
    await requireRemote<InquirySummary[]>('/api/admin/inquiries', token);
  },
  async listInquiries(token: string): Promise<InquirySummary[]> {
    if (isDemoToken(token)) return inquiries.map(({ notes: _notes, ...summary }) => ({ ...summary }));
    return requireRemote<InquirySummary[]>('/api/admin/inquiries', token);
  },

  async getInquiry(token: string, id: string): Promise<InquiryDetail | undefined> {
    if (isDemoToken(token)) return inquiries.find((inquiry) => inquiry.id === id);
    return requireRemote<InquiryDetail>(`/api/admin/inquiries/${id}`, token);
  },

  async updateInquiryStatus(token: string, id: string, status: InquiryStatus): Promise<InquiryDetail | undefined> {
    if (isDemoToken(token)) {
      const inquiry = inquiries.find((candidate) => candidate.id === id);
      if (!inquiry) return undefined;
      inquiry.status = status;
      inquiry.updatedAt = new Date().toISOString();
      return inquiry;
    }
    return requireRemote<InquiryDetail>(`/api/admin/inquiries/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async addInquiryNote(token: string, id: string, content: string): Promise<InquiryDetail | undefined> {
    if (isDemoToken(token)) {
      const inquiry = inquiries.find((candidate) => candidate.id === id);
      if (!inquiry) return undefined;
      inquiry.notes.push({ id: `note-${Date.now()}`, content, authorId: 'admin', createdAt: new Date().toISOString() });
      inquiry.updatedAt = new Date().toISOString();
      return inquiry;
    }
    return requireRemote<InquiryDetail>(`/api/admin/inquiries/${id}/notes`, token, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async getContent(token: string): Promise<ContentDraft> {
    if (isDemoToken(token)) return readDemoContent();
    return requireRemote<ContentDraft>('/api/admin/content', token);
  },

  async updateContent(token: string, content: ContentDraft): Promise<ContentDraft> {
    if (isDemoToken(token)) return writeDemoContent(content);
    return requireRemote<ContentDraft>('/api/admin/content', token, {
      method: 'PATCH',
      body: JSON.stringify(content),
    });
  },

  async updateContentItemStatus(
    token: string,
    type: 'services' | 'projects',
    slug: string,
    status: 'draft' | 'published' | 'archived',
  ): Promise<ContentDraft> {
    const content = await this.getContent(token);
    const item = content[type].find((candidate) => candidate.slug === slug);
    if (!item) throw new AdminApiError('找不到要更新的内容条目。');
    item.status = status;
    return this.updateContent(token, content);
  },

  async publishContent(token: string): Promise<{ ok: boolean; message?: string }> {
    if (isDemoToken(token)) {
      const content = readDemoContent();
      const hasPublishedService = content.services.some((item) => item.status === 'published');
      const hasPublishedProject = content.projects.some((item) => item.status === 'published');
      if (!hasPublishedService || !hasPublishedProject) {
        return { ok: false, message: '演示模式未连接线上发布；发布前还需要补充：至少发布一项服务和一个项目。' };
      }
      return { ok: false, message: '演示模式未连接线上发布；发布前还需要补充：内容只保存在本地草稿，未发布到线上。' };
    }
    return requireRemote<{ ok: boolean; message?: string }>('/api/admin/content/publish', token, { method: 'POST' });
  },
};

