<script setup lang="ts">
import { ArrowUpRight, Clock3 } from 'lucide-vue-next';
import type { PublicService } from '../types';

defineProps<{ service: PublicService }>();
</script>

<template>
  <a class="service-card glass-card" data-testid="service-card" :href="`/services/${service.slug}`">
    <div class="card-topline">
      <span class="eyebrow">{{ service.category }}</span>
      <ArrowUpRight :size="18" aria-hidden="true" />
    </div>
    <h3>{{ service.name }}</h3>
    <p>{{ service.summary }}</p>
    <div class="card-meta">
      <span><Clock3 :size="15" aria-hidden="true" />{{ service.durationLabel }}</span>
      <strong>{{ service.priceLabel }}</strong>
    </div>
  </a>
</template>
