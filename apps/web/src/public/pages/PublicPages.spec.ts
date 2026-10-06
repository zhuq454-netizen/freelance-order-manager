import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../App.vue';

describe('public web experience', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('renders the bright public home positioning and inquiry CTA', async () => {
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain('把复杂需求，整理成可交付的结果');
    expect(wrapper.text()).toContain('发起需求');
    expect(wrapper.findAll('[data-testid="orbital-visual"]').length).toBeGreaterThan(0);
    expect(wrapper.get('main').attributes('id')).toBe('main-content');
  });

  it('renders published service and project cards through public routes', async () => {
    window.history.replaceState({}, '', '/services');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain('服务目录');
    expect(wrapper.findAll('[data-testid="service-card"]').length).toBeGreaterThan(0);

    window.history.replaceState({}, '', '/projects');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushPromises();
    expect(wrapper.text()).toContain('项目案例');
    expect(wrapper.findAll('[data-testid="project-card"]').length).toBeGreaterThan(0);
  });

  it('renders service and project detail routes with a clear next action', async () => {
    window.history.replaceState({}, '', '/services/brand-film');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();
    expect(wrapper.text()).toContain('品牌影像');
    expect(wrapper.findAll('a[href*="/contact"]').length).toBeGreaterThan(0);

    window.history.replaceState({}, '', '/projects/atlas-launch');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Atlas 发布计划');
    expect(wrapper.text()).toContain('项目背景');
  });

  it('prefills inquiry source and requires consent before submit', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ received: true }) });
    vi.stubGlobal('fetch', fetchMock);

    window.history.replaceState({}, '', '/contact?service=brand-film');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

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

  it('keeps public pages free of admin-only inquiry fields', async () => {
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).not.toContain('内部备注');
    expect(wrapper.text()).not.toContain('审核状态');
  });
});
