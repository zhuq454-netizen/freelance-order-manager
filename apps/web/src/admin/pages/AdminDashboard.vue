<script setup lang="ts">
import { Activity, ArrowUpRight, Clock3, Inbox, Plus, Users } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import InquiryTable from '../components/InquiryTable.vue';
import StatCard from '../components/StatCard.vue';
import { adminApi, type InquirySummary } from '../data/fixture';

const props = defineProps<{ token: string }>();
const emit = defineEmits<{ navigate: [path: string] }>();
const inquiries = ref<InquirySummary[]>([]);
const query = ref('');
const status = ref<'all' | InquirySummary['status']>('all');
const filteredInquiries = computed(() =>
  inquiries.value.filter((inquiry) =>
    (status.value === 'all' || inquiry.status === status.value) &&
      `${inquiry.title}${inquiry.contactName}`.toLowerCase().includes(query.value.toLowerCase()),
  ),
);
const newCount = computed(
  () => inquiries.value.filter((inquiry) => inquiry.status === 'new').length,
);
const activeCount = computed(
  () =>
    inquiries.value.filter((inquiry) =>
      ['viewed', 'communicating', 'quoted'].includes(inquiry.status),
    ).length,
);

onMounted(async () => {
  inquiries.value = await adminApi.listInquiries(props.token);
});
</script>

<template>
  <div class="admin-page admin-dashboard-page">
    <header class="admin-page-header">
      <div>
        <p class="eyebrow">MONDAY / 02 OCT 2026</p>
        <h1>管理工作台</h1>
        <p>早上好，Jia。这里是今天的工作节奏。</p>
      </div>
      <button
        class="admin-primary-button admin-primary-button--compact"
        type="button"
        @click="emit('navigate', '/admin/inquiries')"
      >
        <Plus :size="17" aria-hidden="true" /> 新需求
      </button>
    </header>
    <section class="stat-grid" aria-label="需求概览">
      <StatCard label="待处理需求" :value="newCount" detail="需要你查看和分配" :icon="Inbox" />
      <StatCard label="进行中" :value="activeCount" detail="保持沟通节奏" :icon="Activity" />
      <StatCard
        label="本月新联系人"
        :value="inquiries.length"
        detail="来自 3 个入口"
        :icon="Users"
      />
      <StatCard label="平均响应" value="4h 12m" detail="比上周快 18%" :icon="Clock3" />
    </section>
    <div class="dashboard-grid">
      <InquiryTable
        :inquiries="filteredInquiries"
        :query="query"
        :status="status"
        @update:query="query = $event"
        @update:status="status = $event"
        @open="emit('navigate', `/admin/inquiries/${$event}`)"
        @view-all="emit('navigate', '/admin/inquiries')"
      />
      <aside class="panel dashboard-focus-card">
        <div class="panel__header">
          <div>
            <p class="eyebrow">TODAY</p>
            <h2>今日提醒</h2>
          </div>
          <ArrowUpRight :size="19" aria-hidden="true" />
        </div>
        <div class="focus-item">
          <span class="focus-item__time">09:30</span>
          <div>
            <strong>回复新品发布影像</strong>
            <p>林先生 · 首次需求</p>
          </div>
        </div>
        <div class="focus-item">
          <span class="focus-item__time">14:00</span>
          <div>
            <strong>整理内容草稿</strong>
            <p>发布 2 个待补充条目</p>
          </div>
        </div>
        <div class="focus-quote">“让每一个下一步都清楚可见。”</div>
      </aside>
    </div>
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
.admin-primary-button--compact {
  width: auto;
  padding: 0 18px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.stat-card {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
}
.stat-card__topline {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 13px;
}
.stat-card__topline svg {
  color: #ea580c;
}
.stat-card strong {
  display: block;
  margin-top: 16px;
  color: #0f172a;
  font-size: 32px;
  letter-spacing: -0.05em;
}
.stat-card small {
  display: block;
  margin-top: 7px;
  color: #94a3b8;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.75fr);
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
.inquiry-table-panel {
  min-width: 0;
  padding-bottom: 18px;
}
.dashboard-focus-card {
  align-self: start;
}
.focus-item {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}
.focus-item__time {
  min-width: 42px;
  color: #ea580c;
  font-size: 12px;
  font-weight: 800;
}
.focus-item strong {
  font-size: 13px;
}
.focus-item p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 12px;
}
.focus-quote {
  margin: 16px 24px 24px;
  padding: 18px;
  color: #475569;
  background: #fff7ed;
  font-size: 13px;
  line-height: 1.65;
}
@media (max-width: 1020px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
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
  transition:
    background 180ms ease,
    transform 180ms ease;
}
.admin-primary-button:hover {
  background: #c2410c;
  transform: translateY(-1px);
}

.admin-dashboard-page {
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
  --admin-shadow: 0 14px 36px rgba(61, 83, 145, 0.08);
}

.admin-dashboard-page .admin-page-header p:not(.eyebrow),
.admin-dashboard-page .focus-item p {
  color: var(--admin-muted);
}

.admin-dashboard-page .stat-card,
.admin-dashboard-page .panel {
  border-color: var(--admin-border);
  background: var(--admin-surface);
  box-shadow:
    var(--admin-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.admin-dashboard-page .stat-card__topline,
.admin-dashboard-page .stat-card small {
  color: var(--admin-subtle);
}

.admin-dashboard-page .stat-card__topline svg,
.admin-dashboard-page .focus-item__time {
  color: var(--admin-cyan);
}

.admin-dashboard-page .stat-card strong,
.admin-dashboard-page .focus-item strong {
  color: var(--admin-text);
}

.admin-dashboard-page .focus-item {
  border-color: var(--admin-border-soft);
}

.admin-dashboard-page .focus-quote {
  color: var(--admin-muted);
  background: linear-gradient(135deg, var(--admin-brand-soft), var(--admin-cyan-soft));
}

.admin-dashboard-page .admin-primary-button {
  color: #fff;
  background: var(--admin-brand);
}

.admin-dashboard-page .admin-primary-button:hover {
  background: var(--admin-brand-hover);
}
</style>
