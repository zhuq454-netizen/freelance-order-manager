import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PublicExperience from './PublicExperience.vue';

describe('public experience module', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('renders the home page from fixture data when the public API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const wrapper = mount(PublicExperience);
    await vi.dynamicImportSettled();
    await flushPromises();

    expect(wrapper.text()).toContain('把复杂需求，整理成可交付的结果');
    expect(wrapper.text()).toContain('发起需求');
    expect(wrapper.findAll('[data-testid="orbital-visual"]').length).toBeGreaterThan(0);
  });

  it('renders service and project collections plus detail routes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    window.history.replaceState({}, '', '/services');
    const wrapper = mount(PublicExperience);
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('服务目录');
    expect(wrapper.findAll('[data-testid="service-card"]').length).toBeGreaterThan(0);

    window.history.pushState({}, '', '/projects');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('项目案例');
    expect(wrapper.findAll('[data-testid="project-card"]').length).toBeGreaterThan(0);

    window.history.pushState({}, '', '/services/brand-film');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('品牌影像');
    expect(wrapper.text()).toContain('咨询此服务');
  });

  it('prefills and validates the inquiry form before showing success feedback', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ received: true }) });
    vi.stubGlobal('fetch', fetchMock);

    window.history.replaceState({}, '', '/contact?service=brand-film');
    const wrapper = mount(PublicExperience);
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="inquiry-source"]').attributes('value')).toContain('品牌影像');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.text()).toContain('请确认已阅读并同意');

    await wrapper.get('[data-testid="inquiry-consent"]').setValue(true);
    await wrapper.get('[data-testid="inquiry-name"]').setValue('林先生');
    await wrapper.get('[data-testid="inquiry-contact-value"]').setValue('lin@example.com');
    await wrapper.get('[data-testid="inquiry-title"]').setValue('新品发布影像');
    await wrapper.get('[data-testid="inquiry-description"]').setValue('需要一支清晰、有节奏的发布视频。');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('需求已收到');
  });

  it('keeps the inquiry form open when the inquiry POST is offline', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    window.history.replaceState({}, '', '/contact?service=brand-film');
    const wrapper = mount(PublicExperience);
    await vi.dynamicImportSettled();
    await flushPromises();

    await wrapper.get('[data-testid="inquiry-consent"]').setValue(true);
    await wrapper.get('[data-testid="inquiry-name"]').setValue('林先生');
    await wrapper.get('[data-testid="inquiry-contact-value"]').setValue('lin@example.com');
    await wrapper.get('[data-testid="inquiry-title"]').setValue('新品发布影像');
    await wrapper.get('[data-testid="inquiry-description"]').setValue('需要一支清晰、有节奏的发布视频。');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).not.toContain('需求已收到');
    expect(wrapper.text()).toContain('提交暂时失败');
  });

  it('renders service and project detail data and marks fixture projects as examples', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    window.history.replaceState({}, '', '/services/brand-film');
    const wrapper = mount(PublicExperience);
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(wrapper.text()).toContain('交付内容');
    expect(wrapper.text()).toContain('常见问题');
    expect(wrapper.text()).toContain('相关项目');

    window.history.replaceState({}, '', '/projects/atlas-launch');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('技术栈');
    expect(wrapper.text()).toContain('关联服务');
    expect(wrapper.text()).toContain('示例项目');

    window.history.replaceState({}, '', '/projects/northline-space');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('发起类似需求');
    expect(wrapper.text()).toContain('暂不接受类似需求');
  });
});
