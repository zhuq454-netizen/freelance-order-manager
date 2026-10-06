<script setup lang="ts">
import { ArrowUpRight, BarChart3, FileText, Inbox, LogOut } from 'lucide-vue-next';

defineProps<{ currentPath: string }>();
const emit = defineEmits<{ navigate: [path: string]; logout: [] }>();

const links = [
  { path: '/admin', label: '工作台', icon: BarChart3 },
  { path: '/admin/inquiries', label: '需求管理', icon: Inbox, testId: 'admin-nav-inquiries' },
  { path: '/admin/content', label: '内容管理', icon: FileText },
];
</script>

<template>
  <aside class="admin-sidebar" aria-label="管理端侧边导航">
    <div class="admin-sidebar__brand">
      <span class="admin-sidebar__mark" aria-hidden="true">O</span>
      <span>OrderlyDesk</span>
    </div>
    <p class="admin-sidebar__label">Workspace</p>
    <nav class="admin-sidebar__nav">
      <a
        v-for="link in links"
        :key="link.path"
        :href="link.path"
        :data-testid="link.testId"
        :aria-current="currentPath === link.path ? 'page' : undefined"
        @click.prevent="emit('navigate', link.path)"
      >
        <component :is="link.icon" :size="18" stroke-width="1.8" aria-hidden="true" />
        <span>{{ link.label }}</span>
      </a>
    </nav>
    <div class="admin-sidebar__footer">
      <a href="/" data-testid="admin-public-site" @click.prevent="emit('navigate', '/')">
        <ArrowUpRight :size="18" stroke-width="1.8" aria-hidden="true" />
        <span>返回公开站点</span>
      </a>
      <button type="button" @click="emit('logout')">
        <LogOut :size="18" stroke-width="1.8" aria-hidden="true" />
        <span>退出登录</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 18px 20px;
  border-right: 1px solid #dfe7f3;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 10px 0 32px rgba(61, 83, 145, 0.05);
  backdrop-filter: blur(18px);
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  color: #13213c;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.admin-sidebar__mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(135deg, #4f6bff, #22d3ee);
  box-shadow: 0 8px 18px rgba(79, 107, 255, 0.2);
  font-size: 13px;
}

.admin-sidebar__label {
  margin: 42px 10px 10px;
  color: #71809b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.admin-sidebar__nav,
.admin-sidebar__footer {
  display: grid;
  gap: 5px;
}

.admin-sidebar__nav a,
.admin-sidebar__footer a,
.admin-sidebar__footer button {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 42px;
  padding: 0 11px;
  border: 0;
  border-radius: 10px;
  color: #52627d;
  background: transparent;
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.admin-sidebar__nav a:hover,
.admin-sidebar__nav a[aria-current='page'],
.admin-sidebar__footer a:hover,
.admin-sidebar__footer button:hover {
  color: #4058e8;
  background: #eef2ff;
  box-shadow: inset 3px 0 0 #4f6bff;
}

.admin-sidebar__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #edf2f8;
}

@media (max-width: 820px) {
  .admin-sidebar {
    position: static;
    min-height: auto;
    padding: 16px;
    border-right: 0;
    border-bottom: 1px solid #dfe7f3;
  }

  .admin-sidebar__label {
    margin-top: 22px;
  }

  .admin-sidebar__nav,
  .admin-sidebar__footer {
    display: flex;
    flex-wrap: wrap;
  }

  .admin-sidebar__footer {
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
