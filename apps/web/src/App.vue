<script setup lang="ts">
import { computed, defineComponent, h, onMounted, onUnmounted } from 'vue';

import AdminApp from './admin/AdminApp.vue';
import PublicExperience from './public/PublicExperience.vue';
import { createRouter } from './router';

const router = createRouter();
const route = router.currentRoute;

const AppShell = defineComponent({
  name: 'AppShell',
  setup(_, { slots }) {
    return () => h('div', { class: 'app-shell' }, slots.default?.());
  },
});

const PublicShell = defineComponent({
  name: 'PublicShell',
  setup(_, { slots }) {
    return () => h('div', { class: 'public-shell' }, slots.default?.());
  },
});

const AdminShell = defineComponent({
  name: 'AdminShell',
  setup(_, { slots }) {
    return () => h('div', { class: 'admin-shell' }, slots.default?.());
  },
});

const publicLinks = [
  { href: '/', label: '首页' },
  { href: '/services', label: '服务' },
  { href: '/projects', label: '项目' },
  { href: '/contact', label: '发起需求' },
];

const adminLinks = [
  { href: '/admin/login', label: '登录' },
  { href: '/admin', label: '管理台' },
  { href: '/admin/content', label: '内容' },
];

const isAdmin = computed(() => route.value.shell === 'admin');

const navigate = (href: string): void => {
  router.push(href);
};

onMounted(() => {
  router.install();
});

onUnmounted(() => {
  router.destroy();
});
</script>

<template>
  <div class="app-root" :data-shell="route.shell">
    <a class="skip-link" href="#main-content">跳转到主要内容</a>

    <div class="orbital-background" aria-hidden="true">
      <div class="orbital-glow orbital-glow-one"></div>
      <div class="orbital-glow orbital-glow-two"></div>
      <div class="orbital-visual" data-testid="orbital-visual">
        <span class="orbital-ring orbital-ring-one"></span>
        <span class="orbital-ring orbital-ring-two"></span>
        <span class="orbital-core"></span>
      </div>
    </div>

    <AppShell>
      <component :is="isAdmin ? AdminShell : PublicShell">
        <AdminApp
          v-if="isAdmin"
          :route="route"
          :navigate="navigate"
        />

        <template v-else>
        <header class="site-header glass-panel">
          <a
            class="brand-mark"
            href="/"
            aria-label="返回 OrderlyDesk 首页"
            @click.prevent="navigate('/')"
          >
            <span class="brand-dot" aria-hidden="true"></span>
            <span>OrderlyDesk</span>
          </a>

          <nav :aria-label="isAdmin ? '管理端导航' : '公共导航'" class="site-nav">
            <a
              v-for="link in isAdmin ? adminLinks : publicLinks"
              :key="link.href"
              :href="link.href"
              :aria-current="route.path === link.href ? 'page' : undefined"
              @click.prevent="navigate(link.href)"
            >
              {{ link.label }}
            </a>
          </nav>
        </header>

        <PublicExperience :route="route" :navigate="navigate" />

        <footer class="site-footer">
          <span>明亮 Orbital Glass 基础层</span>
          <span aria-hidden="true">·</span>
          <span>可访问、响应式、可扩展</span>
        </footer>
        </template>
      </component>
    </AppShell>
  </div>
</template>
