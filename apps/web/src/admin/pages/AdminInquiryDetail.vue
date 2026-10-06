<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Mail,
  MessageSquareText,
  Phone,
  Save,
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import StatusBadge from '../components/StatusBadge.vue';
import { adminApi, type InquiryDetail, type InquiryStatus } from '../data/fixture';

const props = defineProps<{ token: string; inquiryId: string }>();
const emit = defineEmits<{ navigate: [path: string] }>();
const inquiry = ref<InquiryDetail>();
const note = ref('');
const saved = ref(false);
const status = computed({
  get: () => inquiry.value?.status ?? 'new',
  set: async (value: InquiryStatus) => {
    if (inquiry.value)
      inquiry.value = await adminApi.updateInquiryStatus(props.token, inquiry.value.id, value);
  },
});
const contactIcon = computed(() =>
  inquiry.value?.contactMethod === 'email'
    ? Mail
    : inquiry.value?.contactMethod === 'phone'
      ? Phone
      : MessageSquareText,
);

onMounted(async () => {
  inquiry.value = await adminApi.getInquiry(props.token, props.inquiryId);
});
const saveNote = async (): Promise<void> => {
  if (!inquiry.value || !note.value.trim()) return;
  const content = note.value.trim();
  const updatedInquiry = await adminApi.addInquiryNote(props.token, inquiry.value.id, content);
  if (!updatedInquiry) return;
  inquiry.value = updatedInquiry;
  note.value = '';
  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 2200);
};
</script>

<template>
  <div v-if="inquiry" class="admin-page inquiry-detail-page">
    <button class="back-button" type="button" @click="emit('navigate', '/admin/inquiries')">
      <ArrowLeft :size="17" aria-hidden="true" /> 返回需求列表
    </button>
    <header class="detail-header">
      <div>
        <p class="eyebrow">INQUIRY / {{ inquiry.id }}</p>
        <h1>{{ inquiry.title }}</h1>
        <p>
          {{ inquiry.contactName }} · 提交于
          {{ new Intl.DateTimeFormat('zh-CN').format(new Date(inquiry.createdAt)) }}
        </p>
      </div>
      <StatusBadge :status="inquiry.status" />
    </header>
    <div class="detail-grid">
      <section class="panel detail-main">
        <div class="detail-section">
          <div class="detail-section__heading">
            <h2>需求概述</h2>
            <select v-model="status" data-testid="inquiry-status-select">
              <option value="new">新需求</option>
              <option value="viewed">已查看</option>
              <option value="communicating">沟通中</option>
              <option value="quoted">已报价</option>
              <option value="won">已成交</option>
              <option value="rejected">已拒绝</option>
              <option value="paused">已暂停</option>
              <option value="lost">已流失</option>
            </select>
          </div>
          <p class="detail-description">{{ inquiry.description }}</p>
          <dl class="detail-meta">
            <div>
              <dt>期望时间</dt>
              <dd>
                <CalendarDays :size="16" aria-hidden="true" />{{ inquiry.expectedDate ?? '未填写' }}
              </dd>
            </div>
            <div>
              <dt>预算范围</dt>
              <dd>{{ inquiry.budgetLabel ?? '未填写' }}</dd>
            </div>
            <div>
              <dt>来源服务</dt>
              <dd>{{ inquiry.sourceServiceSlug ?? '直接提交' }}</dd>
            </div>
          </dl>
        </div>
        <div class="detail-section">
          <div class="detail-section__heading">
            <h2>内部备注</h2>
            <span v-if="saved" class="saved-message">已保存</span>
          </div>
          <div v-if="inquiry.notes.length" class="notes-list">
            <p v-for="item in inquiry.notes" :key="item.id">
              <strong>{{ item.authorId }}</strong> · {{ item.content }}
            </p>
          </div>
          <textarea
            v-model="note"
            data-testid="inquiry-note"
            rows="4"
            placeholder="记录沟通结论、下一步或待办"
          ></textarea
          ><button
            class="secondary-button"
            type="button"
            data-testid="save-inquiry-note"
            @click="saveNote"
          >
            <Save :size="16" aria-hidden="true" /> 保存备注
          </button>
        </div>
      </section>
      <aside class="detail-aside">
        <section class="panel contact-card">
          <p class="eyebrow">CONTACT</p>
          <h2>{{ inquiry.contactName }}</h2>
          <p class="contact-method">
            <component :is="contactIcon" :size="17" aria-hidden="true" />{{ inquiry.contactValue }}
          </p>
          <a
            v-if="inquiry.referenceUrl"
            :href="inquiry.referenceUrl"
            target="_blank"
            rel="noreferrer"
            ><ExternalLink :size="16" aria-hidden="true" />参考链接</a
          >
        </section>
        <section class="panel next-step-card">
          <p class="eyebrow">NEXT STEP</p>
          <h2>推进这条需求</h2>
          <p>先确认需求范围，再决定是否进入报价阶段。</p>
          <button class="admin-primary-button" type="button" @click="status = 'communicating'">
            标记为沟通中
          </button>
        </section>
      </aside>
    </div>
  </div>
  <div v-else class="admin-loading">正在加载需求…</div>
</template>

<style scoped>
.admin-page {
  max-width: 1180px;
  margin: 0 auto;
}
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 26px;
  padding: 0;
  border: 0;
  color: #64748b;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
}
.back-button:hover {
  color: #ea580c;
}
.detail-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}
.detail-header h1 {
  max-width: none;
  margin: 8px 0;
  font-size: clamp(34px, 5vw, 54px);
  letter-spacing: -0.06em;
}
.detail-header p:not(.eyebrow) {
  margin: 0;
  color: #64748b;
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.75fr);
  gap: 20px;
}
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
}
.detail-section {
  padding: 26px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-section:last-child {
  border-bottom: 0;
}
.detail-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.detail-section h2,
.contact-card h2,
.next-step-card h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.03em;
}
.detail-section select {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  background: #fff;
}
.detail-description {
  margin: 20px 0 0;
  color: #475569;
  line-height: 1.85;
}
.detail-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 26px 0 0;
}
.detail-meta dt {
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 12px;
}
.detail-meta dd {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #334155;
  font-size: 13px;
}
.detail-meta dd svg {
  color: #ea580c;
}
.detail-section textarea {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  resize: vertical;
  outline: 0;
}
.detail-section textarea:focus {
  border-color: #ea580c;
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
}
.secondary-button,
.admin-primary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  margin-top: 12px;
  padding: 0 14px;
  border-radius: 9px;
  font-weight: 700;
  cursor: pointer;
}
.secondary-button {
  border: 1px solid #cbd5e1;
  color: #475569;
  background: #fff;
}
.admin-primary-button {
  justify-content: center;
  width: 100%;
  border: 0;
  color: #fff;
  background: #ea580c;
}
.saved-message {
  color: #047857;
  font-size: 13px;
}
.notes-list {
  margin-top: 18px;
}
.notes-list p {
  margin: 6px 0;
  padding: 10px 12px;
  border-radius: 8px;
  color: #475569;
  background: #f8fafc;
  font-size: 13px;
}
.detail-aside {
  display: grid;
  align-content: start;
  gap: 20px;
}
.contact-card,
.next-step-card {
  padding: 24px;
}
.contact-card h2,
.next-step-card h2 {
  margin-top: 8px;
}
.contact-method {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  color: #475569;
}
.contact-method svg {
  color: #ea580c;
}
.contact-card a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #ea580c;
  font-size: 13px;
  font-weight: 700;
}
.next-step-card p:not(.eyebrow) {
  color: #64748b;
  line-height: 1.7;
}
.admin-loading {
  padding: 80px;
  text-align: center;
  color: #64748b;
}
@media (max-width: 820px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-meta {
    grid-template-columns: 1fr;
  }
  .detail-header {
    align-items: start;
    flex-direction: column;
  }
}

.inquiry-detail-page {
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

.inquiry-detail-page .back-button {
  color: var(--admin-muted);
}

.inquiry-detail-page .back-button:hover,
.inquiry-detail-page .contact-card a {
  color: var(--admin-brand);
}

.inquiry-detail-page .detail-header p:not(.eyebrow),
.inquiry-detail-page .detail-description,
.inquiry-detail-page .next-step-card p:not(.eyebrow),
.inquiry-detail-page .admin-loading {
  color: var(--admin-muted);
}

.inquiry-detail-page .panel {
  border-color: var(--admin-border);
  background: var(--admin-surface);
  box-shadow:
    0 14px 36px rgba(61, 83, 145, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.inquiry-detail-page .detail-section {
  border-color: var(--admin-border-soft);
}

.inquiry-detail-page .detail-section select,
.inquiry-detail-page .detail-section textarea {
  border-color: var(--admin-border);
  color: var(--admin-text);
  background: rgba(255, 255, 255, 0.9);
}

.inquiry-detail-page .detail-section select:focus,
.inquiry-detail-page .detail-section textarea:focus {
  border-color: var(--admin-brand);
  box-shadow: 0 0 0 4px rgba(79, 107, 255, 0.14);
}

.inquiry-detail-page .detail-meta dt,
.inquiry-detail-page .admin-loading {
  color: var(--admin-subtle);
}

.inquiry-detail-page .detail-meta dd,
.inquiry-detail-page .contact-method,
.inquiry-detail-page .notes-list p {
  color: var(--admin-muted);
}

.inquiry-detail-page .detail-meta dd svg,
.inquiry-detail-page .contact-method svg {
  color: var(--admin-cyan);
}

.inquiry-detail-page .notes-list p {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9), var(--admin-cyan-soft));
}

.inquiry-detail-page .secondary-button {
  border-color: var(--admin-border);
  color: var(--admin-muted);
  background: rgba(255, 255, 255, 0.7);
}

.inquiry-detail-page .admin-primary-button {
  color: #fff;
  background: var(--admin-brand);
}

.inquiry-detail-page .admin-primary-button:hover {
  background: var(--admin-brand-hover);
}

.inquiry-detail-page .saved-message {
  color: #087f8c;
}
</style>
