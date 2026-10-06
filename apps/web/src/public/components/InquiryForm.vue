<script setup lang="ts">
import { CheckCircle2, Send } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { submitInquiry } from '../data/public-api';
import type { InquiryInput, PublicProject, PublicService } from '../types';

const props = defineProps<{ service?: PublicService | undefined; project?: PublicProject | undefined }>();
const submitted = ref(false);
const loading = ref(false);
const error = ref('');
const touched = ref(false);
const form = ref<InquiryInput>({
  contactName: '',
  contactValue: '',
  contactMethod: 'email',
  title: '',
  description: '',
  expectedDate: '',
  budgetLabel: '',
  serviceSlug: props.service?.slug,
  projectSlug: props.project?.slug,
  consent: false,
});

const sourceLabel = computed(() => props.service?.name ?? props.project?.name ?? '通用合作需求');
const fieldErrors = computed<Record<string, string>>(() => {
  const errors: Record<string, string> = {};
  if (!form.value.contactName.trim()) errors.contactName = '请填写称呼。';
  if (!form.value.contactValue.trim()) errors.contactValue = '请填写联系方式。';
  if (!form.value.title.trim()) errors.title = '请填写需求标题。';
  if (!form.value.description.trim()) errors.description = '请填写需求描述。';
  if (!form.value.consent) errors.consent = '请同意隐私说明后再提交。';
  return errors;
});
const invalid = computed(() => Object.keys(fieldErrors.value).length > 0);

const contactPlaceholder = computed(() => {
  if (form.value.contactMethod === 'email') return '例如：lin@example.com';
  if (form.value.contactMethod === 'phone') return '例如：13800000000';
  return '例如：微信号';
});

watch(
  () => [props.service?.slug, props.project?.slug],
  ([serviceSlug, projectSlug]) => {
    form.value.serviceSlug = serviceSlug;
    form.value.projectSlug = projectSlug;
  },
);

const handleSubmit = async () => {
  touched.value = true;
  error.value = '';
  if (invalid.value) {
    error.value = '请确认已阅读并同意隐私说明，并补充必填信息。';
    return;
  }
  loading.value = true;
  try {
    await submitInquiry(form.value);
    submitted.value = true;
  } catch {
    error.value = '提交暂时失败，请稍后再试，或直接通过页面联系方式沟通。';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="inquiry-panel glass-card" aria-labelledby="inquiry-title">
    <div v-if="submitted" class="success-state">
      <span class="success-icon"><CheckCircle2 :size="28" aria-hidden="true" /></span>
      <p class="eyebrow">REQUEST RECEIVED</p>
      <h2>需求已收到</h2>
      <p>我会先阅读你的背景和目标，并在 2 个工作日内回复下一步。</p>
      <a class="button button-secondary" href="/">返回首页</a>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div class="form-heading">
        <p class="eyebrow">START A CONVERSATION</p>
        <h2 id="inquiry-title">把想法说给我听</h2>
        <p>先提供你已经确定的部分即可，预算和时间不确定也没有关系。</p>
      </div>
      <div class="source-pill">当前咨询：<strong>{{ sourceLabel }}</strong></div>
      <input data-testid="inquiry-source" type="hidden" :value="sourceLabel" />
      <div class="form-grid">
        <label>怎么称呼你？<input data-testid="inquiry-name" v-model="form.contactName" autocomplete="name" placeholder="例如：林先生" required :aria-invalid="touched && fieldErrors.contactName ? 'true' : undefined" aria-describedby="field-error-contactName" /><span v-if="touched && fieldErrors.contactName" id="field-error-contactName" data-testid="field-error-contactName" class="form-error">{{ fieldErrors.contactName }}</span></label>
        <label>联系方式类型<select data-testid="inquiry-contact-method" v-model="form.contactMethod" aria-label="联系方式类型"><option value="email">邮箱</option><option value="phone">电话</option><option value="wechat">微信</option></select></label>
        <label>联系方式<input data-testid="inquiry-contact-value" v-model="form.contactValue" :type="form.contactMethod === 'email' ? 'email' : 'text'" :autocomplete="form.contactMethod === 'email' ? 'email' : 'off'" :placeholder="contactPlaceholder" required :aria-invalid="touched && fieldErrors.contactValue ? 'true' : undefined" aria-describedby="field-error-contactValue" /><span v-if="touched && fieldErrors.contactValue" id="field-error-contactValue" data-testid="field-error-contactValue" class="form-error">{{ fieldErrors.contactValue }}</span></label>
        <label>你想推进什么？<input data-testid="inquiry-title" v-model="form.title" placeholder="例如：新品发布影像" required :aria-invalid="touched && fieldErrors.title ? 'true' : undefined" aria-describedby="field-error-title" /><span v-if="touched && fieldErrors.title" id="field-error-title" data-testid="field-error-title" class="form-error">{{ fieldErrors.title }}</span></label>
        <label>期望时间<input v-model="form.expectedDate" placeholder="例如：11 月前，或不确定" /></label>
        <label>预算<input data-testid="inquiry-budget" v-model="form.budgetLabel" placeholder="例如：5-10 万，或暂不确定" /></label>
        <label class="full-field">需求描述<textarea data-testid="inquiry-description" v-model="form.description" rows="5" placeholder="说说背景、目标、已有素材和你最在意的结果" required :aria-invalid="touched && fieldErrors.description ? 'true' : undefined" aria-describedby="field-error-description" /><span v-if="touched && fieldErrors.description" id="field-error-description" data-testid="field-error-description" class="form-error">{{ fieldErrors.description }}</span></label>
      </div>
      <label class="consent-row"><input data-testid="inquiry-consent" v-model="form.consent" type="checkbox" required :aria-invalid="touched && fieldErrors.consent ? 'true' : undefined" aria-describedby="field-error-consent" /> <span>我同意 OrderlyDesk 使用这些信息联系我，仅用于本次需求沟通。</span></label>
      <p v-if="touched && fieldErrors.consent" id="field-error-consent" data-testid="field-error-consent" class="form-error">{{ fieldErrors.consent }}</p>
      <p v-if="touched && error" class="form-error" role="alert">{{ error }}</p>
      <button class="button button-primary" type="submit" :disabled="loading"><Send :size="17" aria-hidden="true" />{{ loading ? '正在提交…' : '提交需求' }}</button>
    </form>
  </section>
</template>
