<script setup lang="ts">
import { ArrowRight, Check, ExternalLink, Layers3, Sparkles } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { resolveRoute, type RouteLocation } from '../router';
import ProjectCard from './components/ProjectCard.vue';
import ServiceCard from './components/ServiceCard.vue';
import InquiryForm from './components/InquiryForm.vue';
import { loadPublicContent } from './data/public-api';
import type { PublicContent } from './types';

const props = defineProps<{
  route?: RouteLocation | undefined;
  navigate?: ((path: string) => void) | undefined;
}>();
const fallbackRoute = ref<RouteLocation>(resolveRoute('/'));

const readWindowRoute = () => {
  if (typeof window === 'undefined') return resolveRoute('/');
  return resolveRoute(`${window.location.pathname}${window.location.search}`);
};

const syncFallbackRoute = () => {
  fallbackRoute.value = readWindowRoute();
};

const activeRoute = computed(() => {
  if (props.route) return props.route;
  return fallbackRoute.value;
});
const content = ref<PublicContent | null>(null);
const loading = ref(true);

onMounted(async () => {
  if (!props.route && typeof window !== 'undefined') {
    syncFallbackRoute();
    window.addEventListener('popstate', syncFallbackRoute);
  }
  content.value = await loadPublicContent();
  loading.value = false;
});

onUnmounted(() => {
  if (!props.route && typeof window !== 'undefined') {
    window.removeEventListener('popstate', syncFallbackRoute);
  }
});

const slug = computed(() => activeRoute.value.path.split('/').pop() ?? '');
const service = computed(() => content.value?.services.find((item) => item.slug === slug.value));
const project = computed(() => content.value?.projects.find((item) => item.slug === slug.value));
const relatedServiceProjects = computed(() => {
  if (!service.value || !content.value) return [];
  return content.value.projects.filter((item) => service.value?.relatedProjectSlugs.includes(item.slug));
});
const relatedProjectServices = computed(() => {
  if (!project.value || !content.value) return [];
  return content.value.services.filter((item) => project.value?.relatedServiceSlugs.includes(item.slug));
});
const sourceService = computed(() => {
  const source = new URLSearchParams(activeRoute.value.query).get('service');
  return source ? content.value?.services.find((item) => item.slug === source) : undefined;
});
const sourceProject = computed(() => {
  const source = new URLSearchParams(activeRoute.value.query).get('project');
  return source ? content.value?.projects.find((item) => item.slug === source) : undefined;
});

const go = (path: string) => props.navigate?.(path);
</script>

<template>
  <div v-if="loading" class="experience-state glass-card"><span class="loader-dot"></span>正在整理公开内容…</div>
  <template v-else-if="content">
    <main v-if="activeRoute.name === 'home'" id="main-content" class="experience-main">
      <section class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow"><Sparkles :size="14" aria-hidden="true" /> PERSONAL SERVICE STUDIO</p>
          <h1>把复杂需求，<span>整理成可交付的结果。</span></h1>
          <p class="hero-lede">{{ content.profile.bio }}</p>
          <div class="hero-actions"><button class="button button-primary" @click="go('/contact')">发起需求 <ArrowRight :size="17" aria-hidden="true" /></button><button class="button button-secondary" @click="go('/projects')">查看项目案例</button></div>
          <div class="signal-row"><span class="signal-live"></span><span>当前接受品牌、内容与空间项目</span><span class="signal-divider"></span><span>2 个工作日内回复</span></div>
        </div>
        <div class="hero-visual" data-testid="orbital-visual"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><div class="visual-orbit orbit-c"></div><div class="visual-core"><span>OD</span><small>ORDERLY<br />DESK</small></div><div class="visual-node node-a">Strategy</div><div class="visual-node node-b">Delivery</div><div class="visual-node node-c">Clarity</div></div>
      </section>
      <section class="proof-strip"><div><strong>01</strong><span>先把问题说清楚</span></div><div><strong>02</strong><span>再把路径排出来</span></div><div><strong>03</strong><span>最后把结果交付好</span></div></section>
      <section class="section-block"><div class="section-heading"><div><p class="eyebrow">SERVICES</p><h2>你可以从这里开始</h2></div><button class="text-link" @click="go('/services')">查看全部服务 <ArrowRight :size="16" aria-hidden="true" /></button></div><div class="service-grid"><ServiceCard v-for="item in content.services" :key="item.slug" :service="item" /></div></section>
      <section class="section-block projects-section"><div class="section-heading"><div><p class="eyebrow">SELECTED WORK</p><h2>做过的项目，会留下方法</h2></div><button class="text-link" @click="go('/projects')">浏览项目档案 <ArrowRight :size="16" aria-hidden="true" /></button></div><div class="project-grid"><ProjectCard v-for="item in content.projects" :key="item.slug" :project="item" /></div></section>
      <section class="cta-banner glass-card"><div><p class="eyebrow">LET'S MAKE IT ORDERLY</p><h2>你正在推进什么？</h2><p>{{ content.profile.contactCta }}</p></div><button class="button button-primary" @click="go('/contact')">告诉我你的需求 <ArrowRight :size="17" aria-hidden="true" /></button></section>
    </main>

    <main v-else-if="activeRoute.name === 'services'" id="main-content" class="page-content"><div class="page-intro"><p class="eyebrow">SERVICE CATALOG</p><h1>服务目录</h1><p>从策略、内容到空间体验，选择一个方向，或者直接说说你正在面对的问题。</p></div><div class="service-grid"><ServiceCard v-for="item in content.services" :key="item.slug" :service="item" /></div></main>
    <main v-else-if="activeRoute.name === 'projects'" id="main-content" class="page-content"><div class="page-intro"><p class="eyebrow">PROJECT ARCHIVE</p><h1>项目案例</h1><p>项目不只是展示结果，也记录问题、判断和可以复用的方法。</p></div><div class="project-grid"><ProjectCard v-for="item in content.projects" :key="item.slug" :project="item" /></div></main>
    <main v-else-if="activeRoute.name === 'service-detail' && service" id="main-content" class="detail-page"><button class="back-link" @click="go('/services')">← 返回服务目录</button><div class="detail-hero"><div><p class="eyebrow">{{ service.category }}</p><h1>{{ service.name }}</h1><p>{{ service.summary }}</p><div class="detail-meta"><span>{{ service.durationLabel }}</span><strong>{{ service.priceLabel }}</strong></div></div><div class="detail-orb"><Layers3 :size="70" aria-hidden="true" /></div></div><div class="detail-columns"><section><h2>适合这些场景</h2><ul class="check-list"><li v-for="item in service.suitableFor" :key="item"><Check :size="16" aria-hidden="true" />{{ item }}</li></ul><h2>交付内容</h2><ul class="check-list"><li v-for="item in service.delivery" :key="item"><Check :size="16" aria-hidden="true" />{{ item }}</li></ul><h2>工作范围</h2><ul class="check-list"><li v-for="item in service.scope" :key="item"><Check :size="16" aria-hidden="true" />{{ item }}</li></ul><h2>常见问题</h2><div v-for="faq in service.faqs" :key="faq.question"><h3>{{ faq.question }}</h3><p>{{ faq.answer }}</p></div><h2>相关项目</h2><div class="project-grid"><ProjectCard v-for="item in relatedServiceProjects" :key="item.slug" :project="item" /></div></section><aside class="sticky-cta glass-card"><p class="eyebrow">READY WHEN YOU ARE</p><h2>聊聊这个方向</h2><p>告诉我你希望达成的结果，我会帮你判断下一步。</p><button class="button button-primary" @click="go(`/contact?service=${service.slug}`)">咨询此服务 <ArrowRight :size="17" aria-hidden="true" /></button></aside></div></main>
    <main v-else-if="activeRoute.name === 'project-detail' && project" id="main-content" class="detail-page"><button class="back-link" @click="go('/projects')">← 返回项目案例</button><div class="project-detail-cover"><img :src="project.coverUrl" :alt="project.name" /><div><p class="eyebrow">{{ project.projectType }}</p><span v-if="project.isExample" class="project-type">示例项目 / 待替换</span><h1>{{ project.name }}</h1><p>{{ project.subtitle }}</p></div></div><div class="detail-columns"><article class="story-content"><div><p class="eyebrow">BACKGROUND</p><h2>项目背景</h2><p>{{ project.background }}</p></div><div><p class="eyebrow">CONTRIBUTION</p><h2>我做了什么</h2><p>{{ project.contribution }}</p></div><div><p class="eyebrow">SOLUTION</p><h2>解决方案</h2><p>{{ project.solution }}</p></div><div><p class="eyebrow">TECH STACK</p><h2>技术栈</h2><div class="tag-row"><span v-for="item in project.techStack" :key="item">{{ item }}</span></div></div><div><p class="eyebrow">OUTCOMES</p><h2>项目成果</h2><ul class="check-list"><li v-for="item in project.outcomes" :key="item"><Check :size="16" aria-hidden="true" />{{ item }}</li></ul></div><div v-if="project.media.length"><p class="eyebrow">MEDIA</p><h2>项目素材</h2><div class="project-grid"><figure v-for="item in project.media" :key="item.url" class="project-media"><img :src="item.url" :alt="item.alt" loading="lazy" /></figure></div></div><div><p class="eyebrow">关联服务</p><div class="tag-row"><a v-for="item in relatedProjectServices" :key="item.slug" :href="`/services/${item.slug}`">{{ item.name }}</a></div></div><a v-if="project.repositoryUrl" class="external-link" :href="project.repositoryUrl" target="_blank" rel="noreferrer">查看代码仓库 <ExternalLink :size="15" aria-hidden="true" /></a></article><aside class="sticky-cta glass-card"><template v-if="project.acceptsSimilarInquiry"><p class="eyebrow">SIMILAR PROJECT?</p><h2>承接类似需求</h2><p>如果你正在面对相近的问题，可以从这个项目开始聊。</p><button class="button button-primary" @click="go(`/contact?project=${project.slug}`)">发起类似需求 <ArrowRight :size="17" aria-hidden="true" /></button></template><p v-else>该项目仅作展示，暂不接受类似需求。</p><a v-if="project.demoUrl" class="external-link" :href="project.demoUrl" target="_blank" rel="noreferrer">查看 Demo <ExternalLink :size="15" aria-hidden="true" /></a></aside></div></main>
    <main v-else-if="activeRoute.name === 'contact'" id="main-content" class="page-content contact-page"><div class="page-intro"><p class="eyebrow">START A CONVERSATION</p><h1>发起需求</h1><p>先把背景和目标交给我，后续一起把它整理成可执行的下一步。</p></div><InquiryForm v-if="sourceService || sourceProject" :service="sourceService" :project="sourceProject" /><InquiryForm v-else /></main>
    <main v-else id="main-content" class="experience-state glass-card"><h1>页面暂时不存在</h1><button class="button button-primary" @click="go('/')">回到首页</button></main>
  </template>
</template>

