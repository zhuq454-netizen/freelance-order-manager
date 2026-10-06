<script setup lang="ts">
import { CheckCircle2, Eye, FileText, Send } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { adminApi, type ContentDraft } from '../data/fixture';

const props = defineProps<{ token: string }>();
const emit = defineEmits<{ navigate: [path: string] }>();
const content = ref<ContentDraft>();
const publishMessage = ref('');
const draftMessage = ref('');
const isPublishing = ref(false);
const loadError = ref('');
onMounted(async () => {
  try {
    content.value = await adminApi.getContent(props.token);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '后台 API 请求失败，请重试。';
  }
});
const saveDraft = async (): Promise<void> => {
  if (!content.value) return;
  content.value = await adminApi.updateContent(props.token, content.value);
  draftMessage.value = adminApi.isDemoToken(props.token)
    ? '演示草稿已保存在本地。'
    : '草稿已保存。';
};
const updateItemStatus = async (
  type: 'services' | 'projects',
  slug: string,
  status: 'draft' | 'published' | 'archived',
): Promise<void> => {
  if (!content.value) return;
  draftMessage.value = adminApi.isDemoToken(props.token)
    ? '演示条目状态已保存在本地；未连接线上发布。'
    : '条目状态正在保存。';
  content.value = await adminApi.updateContentItemStatus(props.token, type, slug, status);
  draftMessage.value = adminApi.isDemoToken(props.token)
    ? '演示条目状态已保存在本地；未连接线上发布。'
    : '条目状态已保存。';
};
const publish = async (): Promise<void> => {
  isPublishing.value = true;
  try {
    const result = await adminApi.publishContent(props.token);
    publishMessage.value = result.message ?? (result.ok ? '内容已发布。' : '发布失败，请稍后重试。');
  } catch (error) {
    publishMessage.value = error instanceof Error ? error.message : '发布失败，请稍后重试。';
  } finally {
    isPublishing.value = false;
  }
};
</script>

<template>
  <div v-if="content" class="admin-page content-page">
    <header class="admin-page-header">
      <div>
        <p class="eyebrow">CONTENT / DRAFT</p>
        <h1>内容管理</h1>
        <p>维护公共端的自我介绍、服务和项目案例。</p>
      </div>
      <div class="content-actions">
        <button class="secondary-button" type="button" data-testid="preview-site" @click="emit('navigate', '/')">
          <Eye :size="17" aria-hidden="true" /> 预览站点</button
        ><button
          class="admin-primary-button admin-primary-button--compact"
          type="button"
          data-testid="publish-content"
          :disabled="isPublishing"
          @click="publish"
        >
          <Send :size="17" aria-hidden="true" /> {{ isPublishing ? '检查中…' : '发布内容' }}
        </button>
      </div>
    </header>
    <p v-if="draftMessage" class="publish-message" role="status">{{ draftMessage }}</p>
    <p v-if="publishMessage" class="publish-message" role="status">
      <CheckCircle2 :size="17" aria-hidden="true" />{{ publishMessage }}
    </p>
    <div class="content-grid">
      <section class="panel draft-preview">
        <div class="panel__header">
          <div>
            <p class="eyebrow">DRAFT PREVIEW</p>
            <h2>草稿预览</h2>
          </div>
          <span class="draft-status"><span></span>未发布</span>
        </div>
        <div class="profile-editor">
          <label>显示名称<input v-model="content.displayName" data-testid="profile-display-name" /></label>
          <label>一句话介绍<input v-model="content.tagline" data-testid="profile-tagline" /></label>
          <label>个人简介<textarea v-model="content.bio" data-testid="profile-bio" rows="3" /></label>
          <label>联系按钮<input v-model="content.contactCta" data-testid="profile-contact-cta" /></label>
          <button class="secondary-button" type="button" data-testid="save-content-draft" @click="saveDraft">保存本地草稿</button>
        </div>
        <div class="preview-canvas">
          <div class="preview-nav">
            <strong>{{ content.displayName }}</strong
            ><span>服务 / 项目 / 发起需求</span>
          </div>
          <div class="preview-hero">
            <p class="eyebrow">INDEPENDENT CREATOR</p>
            <h3>{{ content.tagline }}</h3>
            <p>{{ content.bio }}</p>
            <button type="button">{{ content.contactCta }}</button>
          </div>
        </div>
      </section>
      <aside class="panel content-checklist">
        <div class="panel__header">
          <div>
            <p class="eyebrow">PUBLISH CHECK</p>
            <h2>发布检查</h2>
          </div>
          <FileText :size="19" aria-hidden="true" />
        </div>
        <div class="check-item">
          <span class="check-item__icon check-item__icon--done"
            ><CheckCircle2 :size="17" aria-hidden="true"
          /></span>
          <div>
            <strong>个人简介</strong>
            <p>已完成</p>
          </div>
        </div>
        <div class="check-item">
          <span class="check-item__icon check-item__icon--warning">!</span>
          <div>
            <strong>服务目录</strong>
            <p>还有草稿未发布</p>
          </div>
        </div>
        <div class="check-item">
          <span class="check-item__icon check-item__icon--warning">!</span>
          <div>
            <strong>项目案例</strong>
            <p>还有草稿未发布</p>
          </div>
        </div>
        <div class="content-summary">
          <span>服务</span><strong>{{ content.services.length }} 项</strong><span>项目</span
          ><strong>{{ content.projects.length }} 项</strong>
        </div>
      </aside>
    </div>
    <section class="panel content-items">
      <div class="panel__header">
        <div>
          <p class="eyebrow">LIBRARY</p>
          <h2>内容条目</h2>
        </div>
      </div>
      <div class="content-item-grid">
        <article
          v-for="item in [...content.services, ...content.projects]"
          :key="item.slug"
          class="content-item"
        >
          <div>
            <span class="content-item__type">{{
              content.services.some((service) => service.slug === item.slug) ? '服务' : '项目'
            }}</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.summary }}</p>
          </div>
          <div class="content-item__actions">
            <span class="content-item__status" :class="`content-item__status--${item.status}`">{{
              item.status === 'published' ? '已发布' : item.status === 'archived' ? '已归档' : '草稿'
            }}</span>
            <button
              class="secondary-button content-item__button"
              type="button"
              :data-testid="`publish-content-item-${item.slug}`"
              @click="updateItemStatus(content.services.some((service) => service.slug === item.slug) ? 'services' : 'projects', item.slug, item.status === 'published' ? 'archived' : 'published')"
            >
              {{ item.status === 'published' ? '归档演示' : '发布演示' }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
  <div v-else class="admin-loading">正在加载内容…</div>
</template>

<style scoped>
.admin-page {
  max-width: 1320px;
  margin: 0 auto;
}
.admin-page-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}
.admin-page-header h1 {
  max-width: none;
  margin: 8px 0;
  font-size: clamp(32px, 4vw, 48px);
  letter-spacing: -0.06em;
}
.admin-page-header p:not(.eyebrow) {
  margin: 0;
  color: #64748b;
}
.content-actions {
  display: flex;
  gap: 10px;
}
.admin-primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}
.admin-primary-button {
  border: 0;
  color: #fff;
  background: #ea580c;
}
.admin-primary-button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.admin-primary-button--compact {
  width: auto;
}
.secondary-button {
  border: 1px solid #cbd5e1;
  color: #475569;
  background: #fff;
}
.publish-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -8px 0 20px;
  padding: 12px 14px;
  border-radius: 10px;
  color: #9a3412;
  background: #fff7ed;
  font-size: 13px;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.7fr);
  gap: 20px;
}
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
}
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 18px;
}
.panel h2 {
  margin: 4px 0 0;
  font-size: 20px;
  letter-spacing: -0.03em;
}
.draft-preview {
  overflow: hidden;
}
.draft-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
}
.draft-status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
}
.preview-canvas {
  margin: 0 24px 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
}
.preview-nav {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 11px;
}
.preview-nav strong {
  color: #fff;
  font-size: 13px;
}
.preview-hero {
  min-height: 310px;
  padding: 64px 12%;
  background: radial-gradient(circle at 78% 24%, rgba(234, 88, 12, 0.34), transparent 24%), #0f172a;
}
.preview-hero .eyebrow {
  color: #fb923c;
}
.preview-hero h3 {
  max-width: 12ch;
  margin: 16px 0;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.06em;
}
.preview-hero p:not(.eyebrow) {
  max-width: 370px;
  color: #cbd5e1;
  line-height: 1.7;
}
.preview-hero button {
  margin-top: 18px;
  padding: 10px 14px;
  border: 0;
  border-radius: 8px;
  color: #0f172a;
  background: #fff;
  font-size: 12px;
  font-weight: 800;
}
.check-item {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}
.check-item__icon {
  display: grid;
  place-items: center;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
}
.check-item__icon--done {
  color: #047857;
  background: #ecfdf5;
}
.check-item__icon--warning {
  color: #b45309;
  background: #fffbeb;
}
.check-item strong {
  font-size: 13px;
}
.check-item p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 12px;
}
.content-summary {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin: 18px 24px 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 13px;
}
.content-summary strong {
  color: #334155;
}
.content-items {
  margin-top: 20px;
}
.content-item-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 24px 24px;
}
.content-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.content-item__type {
  color: #ea580c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.content-item h3 {
  margin: 8px 0 5px;
  font-size: 16px;
}
.content-item p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}
.content-item__status {
  align-self: start;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}
.content-item__status--published {
  color: #047857;
  background: #ecfdf5;
}
.content-item__status--draft {
  color: #b45309;
  background: #fffbeb;
}
.admin-loading {
  padding: 80px;
  text-align: center;
  color: #64748b;
}
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
.admin-page-header {
  flex-wrap: wrap;
}
@media (max-width: 580px) {
  .content-actions {
    width: 100%;
  }
  .content-actions > * {
    flex: 1;
  }
  .content-item-grid {
    grid-template-columns: 1fr;
  }
  .preview-nav span {
    display: none;
  }
}

.content-page {
  --admin-surface: rgba(255, 255, 255, 0.82);
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
}

.content-page .admin-page-header p:not(.eyebrow),
.content-page .content-item p,
.content-page .check-item p,
.content-page .admin-loading {
  color: var(--admin-muted);
}

.content-page .panel {
  border-color: var(--admin-border);
  background: var(--admin-surface);
  box-shadow:
    0 14px 36px rgba(61, 83, 145, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.content-page .panel__header,
.content-page .check-item,
.content-page .content-summary {
  border-color: var(--admin-border-soft);
}

.content-page .admin-primary-button {
  color: #fff;
  background: var(--admin-brand);
}

.content-page .admin-primary-button:hover {
  background: var(--admin-brand-hover);
}

.content-page .secondary-button {
  border-color: var(--admin-border);
  color: var(--admin-muted);
  background: rgba(255, 255, 255, 0.72);
}

.content-page .publish-message {
  color: var(--admin-brand);
  background: linear-gradient(135deg, var(--admin-brand-soft), var(--admin-cyan-soft));
}

.content-page .draft-status {
  color: var(--admin-cyan);
}

.content-page .draft-status span {
  background: var(--admin-cyan);
}

.content-page .preview-canvas {
  border-color: rgba(79, 107, 255, 0.18);
  background: linear-gradient(145deg, #f8fbff, #eef2ff);
  color: var(--admin-text);
}

.content-page .preview-nav {
  border-color: rgba(79, 107, 255, 0.12);
  color: var(--admin-muted);
}

.content-page .preview-nav strong {
  color: var(--admin-text);
}

.content-page .preview-hero {
  background:
    radial-gradient(circle at 78% 24%, rgba(34, 211, 238, 0.24), transparent 24%),
    linear-gradient(135deg, #eef2ff, #ffffff);
}

.content-page .preview-hero .eyebrow,
.content-page .content-item__type {
  color: var(--admin-brand);
}

.content-page .preview-hero h3 {
  color: var(--admin-text);
}

.content-page .preview-hero p:not(.eyebrow) {
  color: var(--admin-muted);
}

.content-page .preview-hero button {
  color: #fff;
  background: var(--admin-brand);
}

.content-page .check-item__icon--done,
.content-page .content-item__status--published {
  color: #087f8c;
  background: var(--admin-cyan-soft);
}

.content-page .check-item__icon--warning,
.content-page .content-item__status--draft {
  color: var(--admin-brand);
  background: var(--admin-brand-soft);
}

.content-page .content-item {
  border-color: var(--admin-border);
  background: rgba(255, 255, 255, 0.56);
}

.content-page .content-summary,
.content-page .content-summary strong {
  color: var(--admin-muted);
}
</style>
