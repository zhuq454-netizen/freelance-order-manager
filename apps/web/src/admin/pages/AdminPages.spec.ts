import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../App.vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import InquiryTable from '../components/InquiryTable.vue';
import { adminApi } from '../data/fixture';

describe('private admin experience', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  it('protects the admin workspace behind login', async () => {
    window.history.replaceState({}, '', '/admin');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain('管理端登录');
    expect(wrapper.text()).toContain('仅限本人使用');
    expect(wrapper.get('[data-testid="admin-token"]').attributes('aria-label')).toBe('管理端访问令牌');
  });

  it('supports admin login and renders inquiry workspace with status controls', async () => {
    window.history.replaceState({}, '', '/admin/login');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    await wrapper.get('[data-testid="admin-token"]').setValue('fixture-admin-token');
    await wrapper.get('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('管理工作台');
    expect(wrapper.text()).toContain('新需求');
    expect(wrapper.findAll('[data-testid="inquiry-status-select"]').length).toBeGreaterThan(0);
    expect(wrapper.findAll('[data-testid="admin-nav-inquiries"]').length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('演示模式');
  });

  it('does not treat an unknown token or a failed API request as fixture data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));

    await expect(adminApi.listInquiries('real-token')).rejects.toThrow('后台 API 请求失败');
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/inquiries',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer real-token' }) }),
    );
  });

  it('uses fixture data only for the explicit demo token without requesting the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const inquiries = await adminApi.listInquiries('fixture-admin-token');

    expect(inquiries).toHaveLength(3);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a visible login error when a real token cannot be verified', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));
    window.history.replaceState({}, '', '/admin/login');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    await wrapper.get('[data-testid="admin-token"]').setValue('real-token');
    await wrapper.get('form').trigger('submit');
    await vi.waitFor(() => expect(wrapper.text()).toContain('后台 API 请求失败'));
    expect(window.localStorage.getItem('orderlydesk-admin-token')).toBeNull();
  });

  it('shows inquiry detail and allows adding an internal note', async () => {
    window.localStorage.setItem('orderlydesk-admin-token', 'fixture-admin-token');
    window.history.replaceState({}, '', '/admin/inquiries/inquiry-001');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain('新品发布影像');
    expect(wrapper.text()).toContain('内部备注');
    await wrapper.get('[data-testid="inquiry-note"]').setValue('已安排首次沟通');
    await wrapper.get('[data-testid="save-inquiry-note"]').trigger('click');
    expect(wrapper.text()).toContain('已安排首次沟通');
  });

  it('shows content draft and publication validation messaging', async () => {
    window.localStorage.setItem('orderlydesk-admin-token', 'fixture-admin-token');
    window.history.replaceState({}, '', '/admin/content');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();

    expect(wrapper.text()).toContain('内容管理');
    expect(wrapper.text()).toContain('草稿预览');
    await wrapper.get('[data-testid="publish-content"]').trigger('click');
    expect(wrapper.text()).toContain('发布前还需要补充');
  });

  it('filters the table from a real status change and opens the full inquiry list', async () => {
    const inquiries = await adminApi.listInquiries('fixture-admin-token');
    const wrapper = mount(InquiryTable, {
      props: { inquiries, query: '', status: 'all' },
    });

    await wrapper.get('[data-testid="inquiry-status-select"]').setValue('quoted');
    expect(wrapper.emitted('update:status')?.[0]).toEqual(['quoted']);

    await wrapper.get('[data-testid="view-all-inquiries"]').trigger('click');
    expect(wrapper.emitted('view-all')).toHaveLength(1);
  });

  it('does not route the new record action to an existing inquiry and sends settings to the public site', async () => {
    window.localStorage.setItem('orderlydesk-admin-token', 'fixture-admin-token');
    window.history.replaceState({}, '', '/admin/inquiries');
    const inquiryWrapper = mount(App);
    await vi.dynamicImportSettled();
    await vi.waitFor(() => expect(inquiryWrapper.find('[data-testid="create-inquiry"]').exists()).toBe(true));

    expect(inquiryWrapper.find('[data-testid="create-inquiry"]').attributes('disabled')).toBeDefined();
    expect(inquiryWrapper.text()).toContain('当前没有新建需求 API');

    const sidebar = mount(AdminSidebar, { props: { currentPath: '/admin' } });
    await sidebar.get('[data-testid="admin-public-site"]').trigger('click');
    expect(sidebar.emitted('navigate')).toEqual([['/']]);
  });

  it('edits and persists demo content locally without claiming an online publication', async () => {
    window.localStorage.setItem('orderlydesk-admin-token', 'fixture-admin-token');
    window.history.replaceState({}, '', '/admin/content');
    const wrapper = mount(App);
    await vi.dynamicImportSettled();
    await vi.waitFor(() => expect(wrapper.text()).toContain('内容管理'));

    await wrapper.get('[data-testid="profile-display-name"]').setValue('Jia Fang Studio');
    await wrapper.get('[data-testid="save-content-draft"]').trigger('click');
    expect(wrapper.text()).toContain('演示草稿已保存在本地');
    expect(window.localStorage.getItem('orderlydesk-admin-content-draft')).toContain('Jia Fang Studio');

    await wrapper.get('[data-testid="publish-content-item-brand-film"]').trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('未连接线上发布'));
    await wrapper.get('[data-testid="preview-site"]').trigger('click');
    expect(window.location.pathname).toBe('/');
  });
});
