<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { RouteLocation } from '../router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminContent from './pages/AdminContent.vue';
import AdminDashboard from './pages/AdminDashboard.vue';
import AdminInquiryDetail from './pages/AdminInquiryDetail.vue';
import AdminInquiries from './pages/AdminInquiries.vue';
import AdminLogin from './pages/AdminLogin.vue';
import { adminApi } from './data/fixture';

const props = defineProps<{ route: RouteLocation; navigate: (path: string) => void }>();
const token = ref(
  typeof window === 'undefined'
    ? ''
    : (window.localStorage.getItem('orderlydesk-admin-token') ?? ''),
);
const isAuthenticated = ref(adminApi.isDemoToken(token.value));
const authError = ref('');
const isCheckingAuth = ref(false);
const showLogin = computed(() => !isAuthenticated.value || props.route.name === 'admin-login');

const login = async (nextToken: string): Promise<void> => {
  authError.value = '';
  isCheckingAuth.value = true;
  try {
    await adminApi.verifyToken(nextToken);
    token.value = nextToken;
    isAuthenticated.value = true;
    window.localStorage.setItem('orderlydesk-admin-token', nextToken);
    props.navigate('/admin');
  } catch (error) {
    isAuthenticated.value = false;
    token.value = '';
    window.localStorage.removeItem('orderlydesk-admin-token');
    authError.value = error instanceof Error ? error.message : '后台 API 请求失败，请检查网络后重试。';
  } finally {
    isCheckingAuth.value = false;
  }
};

const logout = (): void => {
  token.value = '';
  isAuthenticated.value = false;
  authError.value = '';
  window.localStorage.removeItem('orderlydesk-admin-token');
  props.navigate('/admin/login');
};

onMounted(async () => {
  if (!token.value) {
    if (props.route.name !== 'admin-login') props.navigate('/admin/login');
    return;
  }
  isCheckingAuth.value = true;
  try {
    await adminApi.verifyToken(token.value);
    isAuthenticated.value = true;
  } catch (error) {
    token.value = '';
    window.localStorage.removeItem('orderlydesk-admin-token');
    authError.value = error instanceof Error ? error.message : '后台 API 请求失败，请检查网络后重试。';
    if (props.route.name !== 'admin-login') props.navigate('/admin/login');
  } finally {
    isCheckingAuth.value = false;
  }
});
</script>

<template>
  <div v-if="showLogin" class="admin-login-layout">
    <AdminLogin :token="token" :external-error="authError" @login="login" />
  </div>
  <div v-else class="admin-app-layout">
    <AdminSidebar :current-path="route.path" @navigate="navigate" @logout="logout" />
    <main id="main-content" class="admin-main">
      <div v-if="isCheckingAuth" class="admin-auth-loading" role="status">正在验证后台访问令牌…</div>
      <template v-else>
      <div v-if="adminApi.isDemoToken(token)" class="admin-demo-banner" role="status">
        演示模式：仅使用本地样例与本地草稿，不处理真实客户数据，也不会伪报线上发布。
      </div>
      <AdminDashboard v-if="route.name === 'admin'" :token="token" @navigate="navigate" />
      <AdminInquiries
        v-else-if="route.name === 'admin-inquiries'"
        :token="token"
        @navigate="navigate"
      />
      <AdminInquiryDetail
        v-else-if="route.name === 'admin-inquiry-detail'"
        :token="token"
        :inquiry-id="route.path.split('/').pop() ?? ''"
        @navigate="navigate"
      />
      <AdminContent v-else-if="route.name === 'admin-content'" :token="token" @navigate="navigate" />
      <AdminDashboard v-else :token="token" @navigate="navigate" />
      </template>
    </main>
  </div>
</template>

<style scoped>
.admin-login-layout {
  min-height: 100vh;
}
.admin-app-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
  color: #0f172a;
  background: #f7f9fc;
}
.admin-main {
  min-width: 0;
  padding: 32px clamp(20px, 4vw, 56px) 48px;
}
.admin-demo-banner {
  margin: 0 auto 20px;
  padding: 12px 16px;
  border: 1px solid #8be5ef;
  border-radius: 12px;
  color: #075985;
  background: #ecfeff;
  font-size: 13px;
  font-weight: 700;
}
.admin-auth-loading {
  padding: 80px 20px;
  color: #52627d;
  text-align: center;
}
@media (max-width: 820px) {
  .admin-app-layout {
    display: block;
  }
  .admin-main {
    padding: 20px 16px 40px;
  }
}

.admin-app-layout {
  --admin-page: #f7f9fc;
  --admin-surface: rgba(255, 255, 255, 0.78);
  --admin-surface-solid: #ffffff;
  --admin-border: #dfe7f3;
  --admin-border-soft: #edf2f8;
  --admin-text: #13213c;
  --admin-muted: #52627d;
  --admin-subtle: #71809b;
  --admin-brand: #4f6bff;
  --admin-brand-hover: #4058e8;
  --admin-brand-soft: #eef2ff;
  --admin-cyan: #0891b2;
  --admin-cyan-soft: #ecfeff;
  --admin-focus: rgba(79, 107, 255, 0.24);
  --admin-shadow: 0 14px 36px rgba(61, 83, 145, 0.08);
  color: var(--admin-text);
  background:
    linear-gradient(rgba(79, 107, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 107, 255, 0.04) 1px, transparent 1px), var(--admin-page);
  background-size: 48px 48px;
}

.admin-main {
  background: radial-gradient(circle at 88% 4%, rgba(34, 211, 238, 0.08), transparent 28rem);
}
</style>
