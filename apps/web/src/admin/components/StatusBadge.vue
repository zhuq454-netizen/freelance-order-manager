<script setup lang="ts">
import type { InquiryStatus } from '../data/fixture';

const props = defineProps<{ status: InquiryStatus }>();

const labels: Record<InquiryStatus, string> = {
  new: '新需求',
  viewed: '已查看',
  communicating: '沟通中',
  quoted: '已报价',
  won: '已成交',
  rejected: '已拒绝',
  paused: '已暂停',
  lost: '已流失',
};
</script>

<template>
  <span class="status-badge" :class="`status-badge--${props.status}`">
    <span class="status-badge__dot" aria-hidden="true"></span>
    {{ labels[props.status] }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 26px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 14%, transparent);
}

.status-badge--new,
.status-badge--quoted {
  color: #4058e8;
  background: #eef2ff;
}

.status-badge--viewed,
.status-badge--communicating {
  color: #087f8c;
  background: #ecfeff;
}

.status-badge--won {
  color: #087f5b;
  background: #ecfdf5;
}

.status-badge--rejected,
.status-badge--lost {
  color: #b4233c;
  background: #fff1f3;
}

.status-badge--paused {
  color: #52627d;
  background: #f1f5f9;
}
</style>
