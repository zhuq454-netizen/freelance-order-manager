<script setup lang="ts">
import { ArrowUpRight, ChevronRight, Search } from 'lucide-vue-next';
import StatusBadge from './StatusBadge.vue';
import type { InquirySummary } from '../data/fixture';

const props = defineProps<{
  inquiries: InquirySummary[];
  query: string;
  status: 'all' | InquirySummary['status'];
}>();
const emit = defineEmits<{
  open: [id: string];
  'update:query': [value: string];
  'update:status': [value: 'all' | InquirySummary['status']];
  'view-all': [];
}>();

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(value));
</script>

<template>
  <section class="panel inquiry-table-panel">
    <div class="panel__header">
      <div>
        <p class="eyebrow">INBOX</p>
        <h2>最近需求</h2>
      </div>
      <div class="table-tools">
        <label class="status-control">
          <span>状态</span>
          <select
            data-testid="inquiry-status-select"
            :value="props.status"
            aria-label="需求状态"
            @change="emit('update:status', ($event.target as HTMLSelectElement).value as 'all' | InquirySummary['status'])"
          >
            <option value="all">全部状态</option>
            <option value="new">新需求</option>
            <option value="viewed">已查看</option>
            <option value="communicating">沟通中</option>
            <option value="quoted">已报价</option>
          </select>
        </label>
        <label class="search-field">
          <Search :size="17" aria-hidden="true" />
          <span class="sr-only">搜索需求</span>
          <input
            :value="query"
            type="search"
            placeholder="搜索联系人或需求"
            @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>需求</th>
            <th>联系人</th>
            <th>状态</th>
            <th>提交时间</th>
            <th><span class="sr-only">查看</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="inquiry in inquiries"
            :key="inquiry.id"
            class="table-row"
            @click="emit('open', inquiry.id)"
          >
            <td>
              <strong>{{ inquiry.title }}</strong
              ><small>{{ inquiry.id }}</small>
            </td>
            <td>{{ inquiry.contactName }}</td>
            <td><StatusBadge :status="inquiry.status" /></td>
            <td class="muted-cell">{{ formatDate(inquiry.createdAt) }}</td>
            <td>
              <button
                class="icon-button"
                type="button"
                :aria-label="`查看${inquiry.title}`"
                @click.stop="emit('open', inquiry.id)"
              >
                <ChevronRight :size="18" aria-hidden="true" />
              </button>
            </td>
          </tr>
          <tr v-if="inquiries.length === 0">
            <td colspan="5" class="empty-state">没有符合条件的需求</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="text-button" type="button" data-testid="view-all-inquiries" @click="emit('view-all')">
      查看全部需求 <ArrowUpRight :size="16" aria-hidden="true" />
    </button>
  </section>
</template>

<style scoped>
.table-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-control {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 12px;
}
.status-control select {
  min-height: 36px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  background: #fff;
}
.search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 210px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #94a3b8;
}
.search-field input {
  width: 100%;
  min-height: 36px;
  border: 0;
  outline: 0;
  color: #334155;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;
  text-align: left;
  font-size: 13px;
}
th {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
}
td strong {
  display: block;
  color: #334155;
}
td small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 11px;
}
.table-row {
  cursor: pointer;
  transition: background-color 160ms ease;
}
.table-row:hover {
  background: #fff7ed;
}
.muted-cell {
  color: #64748b;
}
.icon-button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
}
.icon-button:hover {
  color: #ea580c;
  background: #fff7ed;
}
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 16px 24px 0;
  padding: 0;
  border: 0;
  color: #ea580c;
  background: transparent;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.empty-state {
  padding-block: 40px;
  color: #94a3b8;
  text-align: center;
}
@media (max-width: 700px) {
  .panel__header {
    align-items: stretch;
    flex-direction: column;
  }
  .table-tools {
    align-items: stretch;
    flex-direction: column;
  }
  .search-field {
    min-width: 0;
  }
  th,
  td {
    padding-inline: 14px;
  }
}

.inquiry-table-panel {
  --admin-border: #dfe7f3;
  --admin-border-soft: #edf2f8;
  --admin-text: #13213c;
  --admin-muted: #52627d;
  --admin-subtle: #71809b;
  --admin-brand: #4f6bff;
  --admin-brand-soft: #eef2ff;
  --admin-cyan: #0891b2;
  --admin-cyan-soft: #ecfeff;
}

.inquiry-table-panel .status-control,
.inquiry-table-panel .muted-cell {
  color: var(--admin-muted);
}

.inquiry-table-panel .status-control select,
.inquiry-table-panel .search-field {
  border-color: var(--admin-border);
  background: rgba(255, 255, 255, 0.84);
}

.inquiry-table-panel .status-control select,
.inquiry-table-panel .search-field input,
.inquiry-table-panel td strong {
  color: var(--admin-text);
}

.inquiry-table-panel .search-field {
  color: var(--admin-subtle);
}

.inquiry-table-panel .search-field input:focus {
  outline: 3px solid rgba(79, 107, 255, 0.14);
  outline-offset: 0;
}

.inquiry-table-panel th,
.inquiry-table-panel td {
  border-color: var(--admin-border-soft);
}

.inquiry-table-panel th,
.inquiry-table-panel td small,
.inquiry-table-panel .empty-state {
  color: var(--admin-subtle);
}

.inquiry-table-panel .table-row:hover {
  background: linear-gradient(90deg, var(--admin-brand-soft), var(--admin-cyan-soft));
}

.inquiry-table-panel .icon-button {
  color: var(--admin-muted);
}

.inquiry-table-panel .icon-button:hover {
  color: var(--admin-brand);
  background: var(--admin-brand-soft);
}

.inquiry-table-panel .text-button {
  color: var(--admin-brand);
}
</style>
