<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{ label: string; value: string | number; detail: string; icon: Component }>();
</script>

<template>
  <article class="stat-card">
    <div class="stat-card__topline">
      <span>{{ label }}</span>
      <component :is="icon" :size="18" stroke-width="1.8" aria-hidden="true" />
    </div>
    <strong>{{ value }}</strong>
    <small>{{ detail }}</small>
  </article>
</template>

<style scoped>
.stat-card {
  min-height: 132px;
  padding: 22px;
  border: 1px solid #dfe7f3;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    0 14px 36px rgba(61, 83, 145, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.stat-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 16px;
  font-size: 32px;
  letter-spacing: -0.05em;
}

.stat-card small {
  display: block;
  margin-top: 7px;
}

.stat-card__topline {
  color: #71809b;
}

.stat-card__topline svg {
  color: #0891b2;
}

.stat-card strong {
  color: #13213c;
}

.stat-card small {
  color: #71809b;
}
</style>
