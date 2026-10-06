import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import InquiryForm from './InquiryForm.vue';

const service = {
  slug: 'brand-film',
  name: '品牌影像',
  category: '品牌与传播',
  summary: '把品牌故事整理成有节奏的影像表达。',
  suitableFor: [],
  delivery: [],
  durationLabel: '4-8 周',
  priceLabel: '¥30k 起',
  scope: [],
  faqs: [],
  relatedProjectSlugs: [],
};

const otherService = { ...service, slug: 'digital-campaign', name: '数字传播策划' };

describe('InquiryForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows contact method and budget fields with accessible required errors', async () => {
    const wrapper = mount(InquiryForm);

    await wrapper.get('form').trigger('submit');

    expect(wrapper.get('[data-testid="inquiry-contact-method"]').element.tagName).toBe('SELECT');
    expect(wrapper.get('[data-testid="inquiry-budget"]').element.tagName).toBe('INPUT');
    expect(wrapper.get('[data-testid="inquiry-name"]').attributes('aria-invalid')).toBe('true');
    expect(wrapper.get('[data-testid="inquiry-contact-value"]').attributes('aria-invalid')).toBe('true');
    expect(wrapper.get('[data-testid="field-error-contactName"]').text()).toContain('请填写称呼');
    expect(wrapper.get('[data-testid="field-error-contactValue"]').text()).toContain('请填写联系方式');
    expect(wrapper.get('[data-testid="field-error-consent"]').text()).toContain('请同意');
  });

  it('keeps inquiry source synchronized when props change', async () => {
    const wrapper = mount(InquiryForm, { props: { service } });

    await wrapper.setProps({ service: otherService });

    expect(wrapper.get('[data-testid="inquiry-source"]').attributes('value')).toContain('数字传播策划');

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ received: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await wrapper.get('[data-testid="inquiry-name"]').setValue('林先生');
    await wrapper.get('[data-testid="inquiry-contact-value"]').setValue('lin@example.com');
    await wrapper.get('[data-testid="inquiry-title"]').setValue('传播需求');
    await wrapper.get('[data-testid="inquiry-description"]').setValue('需要帮助。');
    await wrapper.get('[data-testid="inquiry-consent"]').setValue(true);
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    const request = fetchMock.mock.calls[0]?.[1];
    expect(request).toBeDefined();
    expect(JSON.parse(String(request?.body)).serviceSlug).toBe('digital-campaign');
  });
});
