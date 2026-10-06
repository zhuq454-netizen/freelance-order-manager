<script setup lang="ts">
import { Filter } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import InquiryTable from '../components/InquiryTable.vue';
import { adminApi, type InquiryStatus, type InquirySummary } from '../data/fixture';

const props = defineProps<{ token: string }>();
const emit = defineEmits<{ navigate: [path: string] }>();
const inquiries = ref<InquirySummary[]>([]);
const query = ref('');
const status = ref<'all' | InquiryStatus>('all');
const filtered = computed(() =>
  inquiries.value.filter(
    (inquiry) =>
      (status.value === 'all' || inquiry.status === status.value) &&
      `${inquiry.title}${inquiry.contactName}`.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
onMounted(async () => {
  inquiries.value = await adminApi.listInquiries(props.token);
});
</script>

<template>
  <div class="admin-page inquiries-page">
    <header class="admin-page-header">
      <div>
        <p class="eyebrow">INQUIRIES / 03</p>
        <h1>需求管理</h1>
        <p>集中查看每个合作机会，并推进到明确的下一步。</p>
      </div>
      <button
        class="secondary-button"
        type="button"
        data-testid="create-inquiry"
        title="当前没有新建需求 API"
        disabled
      >
        当前没有新建需求 API
      </button>
    </header>
    <div class="filter-bar">
      <div class="filter-title">
        <Filter :size="18" aria-hidden="true" /><strong>全部需求</strong
        ><span>{{ filtered.length }}</span>
      </div>
      <label
        ><span class="sr-only">按状态筛选</span
        ><select v-model="status">
          <option value="all">全部状态</option>
          <option value="new">新需求</option>
          <option value="communicating">沟通中</option>
          <option value="quoted">已报价</option>
          <option value="won">已成交</option>
        </select></label
      >
    </div>
    <InquiryTable
      :inquiries="filtered"
      :query="query"
      :status="status"
      @update:query="query = $event"
      @update:status="status = $event"
      @open="emit('navigate', `/admin/inquiries/${$event}`)"
      @view-all="emit('navigate', '/admin/inquiries')"
    />
  </div>
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
  margin-bottom: 32px;
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
.admin-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  background: #ea580c;
  font-weight: 800;
  cursor: pointer;
}
.admin-primary-button--compact {
  width: auto;
  padding: 0 18px;
}
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
}
.filter-title svg {
  color: #ea580c;
}
.filter-title span {
  padding: 3px 8px;
  border-radius: 99px;
  color: #9a3412;
  background: #ffedd5;
  font-size: 12px;
  font-weight: 800;
}
.filter-bar select {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  background: #fff;
}
@media (max-width: 640px) {
  .admin-page-header {
    display: block;
  }
  .admin-page-header button {
    width: 100%;
    margin-top: 20px;
  }
  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }
  .filter-bar select {
    width: 100%;
  }
}

.inquiries-page {
  --admin-surface: rgba(255, 255, 255, 0.82);
  --admin-border: #dfe7f3;
  --admin-text: #13213c;
  --admin-muted: #52627d;
  --admin-subtle: #71809b;
  --admin-brand: #4f6bff;
  --admin-brand-hover: #4058e8;
  --admin-brand-soft: #eef2ff;
  --admin-cyan: #0891b2;
  --admin-cyan-soft: #ecfeff;
}

.inquiries-page .admin-page-header p:not(.eyebrow),
.inquiries-page .filter-title {
  color: var(--admin-muted);
}

.inquiries-page .filter-bar {
  border-color: var(--admin-border);
  background: var(--admin-surface);
  box-shadow: 0 10px 26px rgba(61, 83, 145, 0.06);
  backdrop-filter: blur(14px);
}

.inquiries-page .filter-title svg {
  color: var(--admin-cyan);
}

.inquiries-page .filter-title span {
  color: var(--admin-brand);
  background: var(--admin-brand-soft);
}

.inquiries-page .filter-bar select {
  border-color: var(--admin-border);
  color: var(--admin-text);
  background: rgba(255, 255, 255, 0.9);
}

.inquiries-page .admin-primary-button {
  color: #fff;
  background: var(--admin-brand);
}

.inquiries-page .admin-primary-button:hover {
  background: var(--admin-brand-hover);
}
</style>
