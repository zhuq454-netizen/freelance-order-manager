<template>
  <view class="page">
    <view class="card">
      <view class="brand-line" />
      <text class="eyebrow">{{ APP_NAME }}</text>
      <text class="title">移动端基础架构</text>
      <text class="description">
        当前页面用于验证 uni-app、共享元数据和亮色 Design Token，不包含业务功能。
      </text>
      <view class="status">
        <text class="status-text">开发基线已加载</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { APP_NAME } from '@orderlydesk/shared';
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-5;
  background: $color-page;
}

.card {
  width: 100%;
  padding: $spacing-6;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-surface;
  box-shadow: $shadow-card;
}

.brand-line {
  width: 96rpx;
  height: 8rpx;
  margin-bottom: $spacing-6;
  border-radius: $radius-pill;
  background: linear-gradient(135deg, $color-brand-primary, $color-tech-blue, $color-tech-cyan);
}

.eyebrow,
.title {
  display: block;
}

.eyebrow {
  color: $color-brand-primary;
  font-size: $font-size-sm;
  font-weight: 600;
}

.title {
  margin-top: $spacing-2;
  color: $color-text-primary;
  font-size: 48rpx;
  font-weight: 700;
}

.description {
  display: block;
  margin-top: $spacing-4;
  color: $color-text-secondary;
  font-size: $font-size-base;
  line-height: 1.7;
}

.status {
  display: inline-flex;
  margin-top: $spacing-6;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-pill;
  background: $color-brand-soft;
}

.status-text {
  color: $color-brand-primary;
  font-size: $font-size-sm;
  font-weight: 600;
}
</style>
