<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import type { PublicProject } from '../types';

defineProps<{ project: PublicProject }>();
</script>

<template>
  <a class="project-card glass-card" data-testid="project-card" :href="`/projects/${project.slug}`">
    <div class="project-media">
      <img :src="project.coverUrl" :alt="project.name" loading="lazy" />
      <span class="project-type">{{ project.projectType }}</span>
      <span v-if="project.isExample" class="project-type">示例 / 待替换</span>
      <span class="project-arrow" aria-hidden="true"><ArrowUpRight :size="18" /></span>
    </div>
    <div class="project-content">
      <div class="tag-row"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
      <h3>{{ project.name }}</h3>
      <p>{{ project.summary }}</p>
    </div>
  </a>
</template>
