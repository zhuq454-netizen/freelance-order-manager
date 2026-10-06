import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import App from './App.vue';

describe('OrderlyDesk application shell', () => {
  it('renders a skip link and the public navigation', () => {
    const wrapper = mount(App);

    expect(wrapper.get('a[href="#main-content"]').text()).toContain('跳转到主要内容');
    expect(wrapper.text()).toContain('OrderlyDesk');
    expect(wrapper.text()).toContain('服务');
    expect(wrapper.text()).toContain('项目');
    expect(wrapper.text()).toContain('发起需求');
  });
});
