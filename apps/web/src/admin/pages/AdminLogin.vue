<script setup lang="ts">
import { ArrowRight, LockKeyhole } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{ token: string; externalError?: string }>();
const emit = defineEmits<{ login: [token: string] }>();
const input = ref('');
const error = ref('');

const submit = (): void => {
  if (!input.value.trim()) {
    error.value = '请输入管理端访问令牌。';
    return;
  }
  error.value = '';
  emit('login', input.value.trim());
};
</script>

<template>
  <div class="admin-login-page">
    <div class="admin-login-page__aside">
      <div class="admin-login-page__grid" aria-hidden="true"></div>
      <p class="admin-kicker">ORDERLYDESK / PRIVATE WORKSPACE</p>
      <h1>把每个需求，<br /><em>推进到下一步。</em></h1>
      <p class="admin-login-page__intro">管理需求、整理内容、保持交付节奏。这里是你的工作后台。</p>
      <div class="admin-login-page__signal">
        <span></span><span></span><span></span><span></span><small>LOCAL WORKSPACE · READY</small>
      </div>
    </div>
    <section class="admin-login-card" aria-labelledby="admin-login-title">
      <div class="admin-login-card__icon"><LockKeyhole :size="20" aria-hidden="true" /></div>
      <p class="admin-kicker">PRIVATE ACCESS</p>
      <h2 id="admin-login-title">管理端登录</h2>
      <p>仅限本人使用。输入访问令牌后进入工作台。</p>
      <form @submit.prevent="submit">
        <label for="admin-token">访问令牌</label>
        <input
          id="admin-token"
          v-model="input"
          data-testid="admin-token"
          aria-label="管理端访问令牌"
          autocomplete="current-password"
          type="password"
          placeholder="输入 fixture-admin-token"
        />
        <p v-if="error || props.externalError" class="form-error" role="alert">{{ error || props.externalError }}</p>
        <button class="admin-primary-button" type="submit">
          进入工作台 <ArrowRight :size="17" aria-hidden="true" />
        </button>
      </form>
      <small class="admin-login-card__hint">本地演示可使用 fixture-admin-token</small>
    </section>
  </div>
</template>

<style scoped>
.admin-login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  min-height: 100vh;
  background: #f7f9fc;
}
.admin-login-page__aside {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: clamp(40px, 9vw, 120px);
  color: #fff;
  background: #0f172a;
}
.admin-login-page__aside::after {
  position: absolute;
  right: -8%;
  bottom: -22%;
  width: 520px;
  height: 520px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  box-shadow:
    0 0 0 48px rgba(255, 255, 255, 0.025),
    0 0 0 96px rgba(255, 255, 255, 0.025);
  content: '';
}
.admin-login-page__grid {
  position: absolute;
  inset: 0;
  opacity: 0.13;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.28) 1px, transparent 1px);
  background-size: 48px 48px;
}
.admin-kicker {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.admin-login-page__aside .admin-kicker {
  color: #94a3b8;
}
.admin-login-page h1 {
  position: relative;
  z-index: 1;
  max-width: 11ch;
  margin: 24px 0;
  color: #fff;
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1.02;
  letter-spacing: -0.06em;
}
.admin-login-page h1 em {
  color: #fb923c;
  font-style: normal;
}
.admin-login-page__intro {
  position: relative;
  z-index: 1;
  max-width: 400px;
  margin: 0;
  color: #cbd5e1;
  line-height: 1.8;
}
.admin-login-page__signal {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 56px;
  color: #94a3b8;
}
.admin-login-page__signal span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fb923c;
}
.admin-login-page__signal span:nth-child(2) {
  opacity: 0.7;
}
.admin-login-page__signal span:nth-child(3) {
  opacity: 0.45;
}
.admin-login-page__signal span:nth-child(4) {
  opacity: 0.2;
}
.admin-login-page__signal small {
  margin-left: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
}
.admin-login-card {
  align-self: center;
  width: min(100% - 48px, 430px);
  margin-inline: auto;
  padding: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}
.admin-login-card__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 28px;
  border-radius: 12px;
  color: #ea580c;
  background: #fff7ed;
}
.admin-login-card h2 {
  margin: 10px 0;
  font-size: 32px;
  letter-spacing: -0.04em;
}
.admin-login-card > p:not(.admin-kicker) {
  margin: 0 0 28px;
  color: #64748b;
  line-height: 1.7;
}
.admin-login-card label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}
.admin-login-card input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: 0;
}
.admin-login-card input:focus {
  border-color: #ea580c;
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.12);
}
.admin-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  margin-top: 18px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  background: #ea580c;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 180ms ease,
    transform 180ms ease;
}
.admin-primary-button:hover {
  background: #c2410c;
  transform: translateY(-1px);
}
.form-error {
  margin: 8px 0 0;
  color: #b91c1c;
  font-size: 13px;
}
.admin-login-card__hint {
  display: block;
  margin-top: 22px;
  color: #94a3b8;
  font-size: 12px;
}
@media (max-width: 720px) {
  .admin-login-page {
    grid-template-columns: 1fr;
  }
  .admin-login-page__aside {
    min-height: 390px;
    padding: 48px 28px;
  }
  .admin-login-page__aside h1 {
    font-size: 48px;
  }
  .admin-login-card {
    margin: 28px auto;
  }
}

.admin-login-page {
  --admin-page: #f7f9fc;
  --admin-surface: rgba(255, 255, 255, 0.84);
  --admin-border: #dfe7f3;
  --admin-text: #13213c;
  --admin-muted: #52627d;
  --admin-subtle: #71809b;
  --admin-brand: #4f6bff;
  --admin-brand-hover: #4058e8;
  --admin-brand-soft: #eef2ff;
  --admin-cyan: #0891b2;
  --admin-cyan-soft: #ecfeff;
  --admin-focus: rgba(79, 107, 255, 0.24);
  color: var(--admin-text);
  background:
    linear-gradient(rgba(79, 107, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 107, 255, 0.045) 1px, transparent 1px), var(--admin-page);
  background-size: 48px 48px;
}

.admin-login-page__aside {
  color: var(--admin-text);
  background:
    radial-gradient(circle at 82% 22%, rgba(34, 211, 238, 0.2), transparent 24rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(238, 242, 255, 0.9));
}

.admin-login-page__aside::after {
  border-color: rgba(79, 107, 255, 0.18);
  box-shadow:
    0 0 0 48px rgba(79, 107, 255, 0.05),
    0 0 0 96px rgba(34, 211, 238, 0.05);
}

.admin-login-page__grid {
  opacity: 0.65;
  background-image:
    linear-gradient(rgba(79, 107, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 107, 255, 0.1) 1px, transparent 1px);
}

.admin-kicker,
.admin-login-page__aside .admin-kicker {
  color: var(--admin-brand);
}

.admin-login-page h1 {
  color: var(--admin-text);
}

.admin-login-page h1 em {
  color: var(--admin-brand);
}

.admin-login-page__intro {
  color: var(--admin-muted);
}

.admin-login-page__signal {
  color: var(--admin-subtle);
}

.admin-login-page__signal span {
  background: var(--admin-cyan);
}

.admin-login-card {
  border-color: var(--admin-border);
  background: var(--admin-surface);
  box-shadow:
    0 18px 48px rgba(61, 83, 145, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
}

.admin-login-card__icon {
  color: var(--admin-brand);
  background: var(--admin-brand-soft);
}

.admin-login-card > p:not(.admin-kicker),
.admin-login-card__hint {
  color: var(--admin-muted);
}

.admin-login-card label {
  color: var(--admin-text);
}

.admin-login-card input {
  border-color: var(--admin-border);
  color: var(--admin-text);
  background: rgba(255, 255, 255, 0.9);
}

.admin-login-card input:focus {
  border-color: var(--admin-brand);
  box-shadow: 0 0 0 4px var(--admin-focus);
}

.admin-primary-button {
  color: #fff;
  background: var(--admin-brand);
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.admin-primary-button:hover {
  background: var(--admin-brand-hover);
  box-shadow: 0 10px 22px rgba(79, 107, 255, 0.22);
}

.form-error {
  color: #b4233c;
}

@media (prefers-reduced-motion: reduce) {
  .admin-primary-button {
    transition: none;
  }
}
</style>
