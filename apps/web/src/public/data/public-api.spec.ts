import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitInquiry } from './public-api';

const input = {
  contactName: '林先生',
  contactValue: 'lin@example.com',
  contactMethod: 'email' as const,
  title: '新品发布影像',
  description: '需要一支发布视频。',
  budgetLabel: '5-10 万',
  consent: true,
};

describe('public inquiry API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts a successful inquiry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ received: true }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitInquiry(input)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith('/api/public/inquiries', {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('propagates offline failures instead of reporting success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(submitInquiry(input)).rejects.toThrow('offline');
  });
});
