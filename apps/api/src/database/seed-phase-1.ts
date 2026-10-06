import type { Database } from './database.module.js';
import {
  providerProfiles,
  projects,
  projectServices,
  services,
} from './schema.js';

export const phaseOneProfile = {
  id: '00000000-0000-4000-8000-000000000001',
  displayName: 'OrderlyDesk',
  tagline: '把复杂工作整理成可交付的数字产品。',
  bio: '专注于产品梳理、界面设计和轻量级业务系统实现。',
  serviceDirections: ['产品梳理', '界面设计', '业务系统实现'],
  skills: ['产品设计', 'Vue', 'NestJS', 'PostgreSQL'],
  process: ['澄清目标', '拆解方案', '迭代交付'],
  contactCta: '告诉我你想解决的问题',
};

export const phaseOneServices = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    slug: 'product-clarification',
    name: '产品需求梳理',
    category: '产品设计',
    summary: '把模糊想法整理成可执行的产品方案。',
    suitableFor: ['早期产品', '内部工具', '业务流程优化'],
    scope: ['目标与用户梳理', '功能边界定义', '优先级与交付计划'],
    delivery: ['需求文档', '页面结构', '实施建议'],
    durationLabel: '1 至 2 周',
    priceLabel: '按范围评估',
    faqs: [],
    status: 'published',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    slug: 'business-web-app',
    name: '轻量业务系统',
    category: '开发实现',
    summary: '为个人和小团队搭建清晰可靠的业务后台。',
    suitableFor: ['内容管理', '线索收集', '内部协作'],
    scope: ['信息架构', '管理界面', 'API 与数据模型'],
    delivery: ['可运行原型', '基础接口', '部署说明'],
    durationLabel: '2 至 6 周',
    priceLabel: '按范围评估',
    faqs: [],
    status: 'published',
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    slug: 'content-and-visual-design',
    name: '内容与视觉设计',
    category: '内容设计',
    summary: '把信息、结构和视觉表达整理成清晰的对外内容。',
    suitableFor: ['个人品牌', '服务展示', '项目案例'],
    scope: ['内容结构', '视觉方向', '发布素材'],
    delivery: ['内容框架', '视觉稿', '交付清单'],
    durationLabel: '1 至 3 周',
    priceLabel: '按范围评估',
    faqs: [],
    status: 'published',
  },
];

export const phaseOneProjects = [
  {
    id: '00000000-0000-4000-8000-000000000201',
    slug: 'orderlydesk-foundation',
    name: 'OrderlyDesk 基础平台',
    subtitle: '从个人服务展示到需求管理',
    coverUrl: 'https://example.com/orderlydesk-foundation.jpg',
    summary: '一个面向个人服务商的公开展示与后台管理基础平台。',
    projectType: '产品与系统',
    tags: ['产品设计', 'NestJS', 'PostgreSQL'],
    background: '需要一个稳定的服务展示和需求收集入口。',
    contribution: '负责产品边界、数据模型和基础 API 架构。',
    solution: '通过公开内容、需求提交和管理员后台形成最小闭环。',
    techStack: ['TypeScript', 'NestJS', 'Drizzle', 'PostgreSQL'],
    outcomes: ['建立公开展示入口', '沉淀结构化需求'],
    media: [],
    acceptsSimilarInquiry: true,
    status: 'published',
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    slug: 'service-content-system',
    name: '服务内容系统',
    subtitle: '把服务能力整理成可复用的内容资产',
    coverUrl: 'https://example.com/service-content-system.jpg',
    summary: '为个人服务商整理服务说明、案例和需求入口。',
    projectType: '内容与设计',
    tags: ['内容设计', '信息架构'],
    background: '服务信息分散在不同渠道，客户难以快速理解服务范围。',
    contribution: '负责内容结构、服务表达和交付边界梳理。',
    solution: '以服务卡片、项目案例和统一询价入口承载对外信息。',
    techStack: ['TypeScript', 'Vue', 'Zod'],
    outcomes: ['统一服务表达', '缩短沟通准备时间'],
    media: [],
    acceptsSimilarInquiry: true,
    status: 'published',
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    slug: 'workflow-automation-kit',
    name: '工作流自动化工具包',
    subtitle: '从重复记录到清晰的工作台流程',
    coverUrl: 'https://example.com/workflow-automation-kit.jpg',
    summary: '把重复的需求记录和交付准备整理成轻量工作流。',
    projectType: '业务系统',
    tags: ['业务系统', '自动化'],
    background: '重复的记录和跟进动作占用大量时间，信息也难以保持一致。',
    contribution: '负责流程拆解、数据模型和基础实现。',
    solution: '用结构化字段和可追踪状态减少手工重复操作。',
    techStack: ['NestJS', 'PostgreSQL', 'Drizzle'],
    outcomes: ['减少重复录入', '提高交付可追踪性'],
    media: [],
    acceptsSimilarInquiry: true,
    status: 'published',
  },
];

export async function seedPhaseOne(database: Database): Promise<void> {
  await database
    .insert(providerProfiles)
    .values({ ...phaseOneProfile })
    .onConflictDoNothing();
  await database
    .insert(services)
    .values([...phaseOneServices])
    .onConflictDoNothing();
  await database
    .insert(projects)
    .values([...phaseOneProjects])
    .onConflictDoNothing();
  await database
    .insert(projectServices)
    .values(
      phaseOneProjects.flatMap((project) =>
        phaseOneServices.map((service) => ({
          projectId: project.id,
          serviceId: service.id,
        })),
      ),
    )
    .onConflictDoNothing();
}
