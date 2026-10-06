import type { PublicContent, PublicProject, PublicService } from '../types';

const image = (seed: string, width = 1200): string =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=${width}&q=82`;

export const fixtureServices: PublicService[] = [
  {
    slug: 'brand-film',
    name: '品牌影像',
    category: '品牌与传播',
    summary: '把品牌故事整理成有节奏、有记忆点、能持续使用的影像资产。',
    suitableFor: ['品牌焕新', '新品发布', '年度传播', '团队文化表达'],
    delivery: ['创意方向与脚本', '拍摄统筹与现场执行', '剪辑、声音与多尺寸交付'],
    durationLabel: '4–8 周',
    priceLabel: '¥30,000 起',
    scope: ['品牌叙事梳理', '分镜与拍摄方案', '主片与社媒短版', '字幕、封面与交付规范'],
    faqs: [
      { question: '适合还没有完整素材的团队吗？', answer: '适合。我们会从目标、受众和现有资产开始，逐步建立可执行的内容方案。' },
      { question: '可以只做后期剪辑吗？', answer: '可以。已有素材也可以从整理、节奏设计、声音和版本适配开始合作。' },
    ],
    relatedProjectSlugs: ['atlas-launch', 'northline-space'],
  },
  {
    slug: 'digital-campaign',
    name: '数字传播策划',
    category: '策略与内容',
    summary: '从传播目标出发，搭建一套清晰、可落地、能复盘的内容计划。',
    suitableFor: ['产品上线', '社媒增长', '活动传播', '内容体系搭建'],
    delivery: ['传播策略与受众拆解', '主题、栏目与内容排期', '数据观察与迭代建议'],
    durationLabel: '2–6 周',
    priceLabel: '¥18,000 起',
    scope: ['现状诊断', '传播主张', '内容架构', '执行清单与复盘模板'],
    faqs: [{ question: '会提供具体的执行物料吗？', answer: '会。交付范围会根据目标确定，可包含脚本、文案、视觉参考和执行排期。' }],
    relatedProjectSlugs: ['atlas-launch'],
  },
  {
    slug: 'spatial-storytelling',
    name: '空间叙事设计',
    category: '空间与体验',
    summary: '让空间、动线与内容彼此配合，形成访客能理解也愿意停留的体验。',
    suitableFor: ['展陈空间', '商业空间', '办公品牌', '线下活动'],
    delivery: ['体验路径梳理', '内容层级与导视建议', '展示节点与现场文案'],
    durationLabel: '3–10 周',
    priceLabel: '¥25,000 起',
    scope: ['访客旅程', '内容地图', '节点叙事', '现场沟通与落地建议'],
    faqs: [],
    relatedProjectSlugs: ['northline-space'],
  },
];

export const fixtureProjects: PublicProject[] = [
  {
    slug: 'atlas-launch',
    name: 'Atlas 发布计划',
    subtitle: '一次让产品被准确理解的发布',
    coverUrl: image('photo-1516321318423-f06f85e504b3'),
    summary: '为一款面向专业团队的协作产品，建立从发布主张到内容节奏的完整表达。',
    projectType: '品牌传播',
    tags: ['策略', '影像', '社媒'],
    updatedAt: '2026-09-18T09:00:00.000Z',
    background: '产品功能丰富，但不同受众接收到的信息过于分散，发布节点也缺少统一的叙事主线。',
    contribution: '我们负责从产品理解、传播主张到发布内容的整体梳理，并协同内部团队完成落地。',
    solution: '以“让协作回到清晰”为核心，搭建主片、产品演示、社媒短内容和销售支持材料的内容矩阵。',
    techStack: ['传播策略', '脚本与分镜', '内容系统', '项目统筹'],
    outcomes: ['形成一条统一的产品叙事', '首发内容覆盖官网、社媒与销售场景', '沉淀可复用的内容模板'],
    media: [{ url: image('photo-1556761175-b413da4baf72'), alt: '团队围绕发布计划进行讨论' }],
    acceptsSimilarInquiry: true,
    relatedServiceSlugs: ['brand-film', 'digital-campaign'],
    isExample: true,
  },
  {
    slug: 'northline-space',
    name: 'Northline 空间叙事',
    subtitle: '把一栋建筑讲给第一次来的人听',
    coverUrl: image('photo-1487958449943-2429e8be8625'),
    summary: '重新整理展厅与公共区域的内容层级，让空间体验有方向、有停留、有记忆。',
    projectType: '空间体验',
    tags: ['空间', '导视', '文案'],
    updatedAt: '2026-08-06T09:00:00.000Z',
    background: '场地拥有丰富的建筑信息，但参观者在进入后很难快速理解空间与品牌的关系。',
    contribution: '我们从访客旅程出发，重新定义入口、核心展项和离场节点的内容职责。',
    solution: '以清晰的内容地图串联导视、展项说明和互动节点，减少阅读负担，增加现场停留理由。',
    techStack: ['访客旅程', '内容地图', '空间文案', '现场协作'],
    outcomes: ['建立统一的现场语气', '缩短首次理解路径', '让导视与展示内容形成整体'],
    media: [{ url: image('photo-1497366754035-f200968a6e72'), alt: '明亮的空间与清晰的导视关系' }],
    acceptsSimilarInquiry: false,
    relatedServiceSlugs: ['spatial-storytelling', 'brand-film'],
    isExample: true,
  },
];

export const fixtureContent: PublicContent = {
  profile: {
    displayName: 'OrderlyDesk',
    tagline: '把复杂需求，整理成可交付的结果',
    bio: 'OrderlyDesk 为品牌、产品和空间项目提供策略、内容与执行支持，让想法在真实的时间、预算与协作关系中稳稳落地。',
    serviceDirections: ['品牌与传播', '策略与内容', '空间与体验'],
    skills: ['结构化思考', '内容表达', '项目统筹', '跨团队协作'],
    process: ['先把问题说清楚', '再把路径排出来', '最后把结果交付好'],
    contactCta: '告诉我你正在推进什么，我会在 2 个工作日内回复下一步。',
  },
  services: fixtureServices,
  projects: fixtureProjects,
};
