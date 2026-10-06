# OrderlyDesk 文档中心

OrderlyDesk 是面向个人服务提供者的接单与作品展示平台。当前 Phase 1 只聚焦：公开个人资料、服务展示、作品集、匿名需求提交，以及单管理员的内容和需求管理。

## 从零开始

1. Windows 本地开发：`03-development/windows-local-development.md`
2. Windows 本机部署：`04-deployment/windows-local-deployment.md`
3. Linux 虚拟机部署：`04-deployment/vm-linux-deployment.md`
4. 环境变量：`03-development/environment-variables.md`
5. 数据库迁移：`03-development/database-migration.md`
6. Windows 验收：`05-verification/windows-acceptance-checklist.md`
7. 虚拟机验收：`05-verification/vm-acceptance-checklist.md`
8. Kubernetes 学习路线：`04-deployment/kubernetes-learning-path.md`
9. 命令速查：`06-operations/command-reference.md`
10. 发布验收：`05-verification/phase-1-release-checklist.md`

## 产品与设计

- `01-product/product-strategy.md`
- `01-product/phase-1-requirements.md`
- `01-product/user-flows.md`
- `01-product/portfolio-design.md`
- `02-design/design-system.md`
- `design-system/orderlydesk/MASTER.md`

## 当前技术边界

- Web：Vue 3、Vite、TypeScript、Tailwind CSS、Lucide。
- API：NestJS、Zod、OpenAPI、Drizzle ORM。
- 数据：PostgreSQL 16；Redis、MinIO、Mailpit 作为本地和虚拟机环境依赖。
- 部署：Windows 使用 Docker Desktop；虚拟机使用 Ubuntu 24.04 LTS、Docker Engine、Docker Compose Plugin 和 Nginx。
- Phase 1 不包含客户账号、多服务商入驻、支付、评价、实时聊天、自动匹配、正式报价/订单/财务流程。

## 常用命令

```powershell
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

## 安全原则

- 不把真实密码、ADMIN_TOKEN、数据库连接串提交到仓库。
- 不执行 `docker compose down -v`，除非已经确认数据库备份可恢复。
- 生产环境必须替换示例密码，并限制 PostgreSQL、Redis、MinIO 只在内部网络可访问。

## 本轮部署决策记录

- 当前虚拟机方案不是“在虚拟机里直接运行源码”，而是“源码驱动的 Docker 镜像部署”：Compose 根据仓库中的 Dockerfile 构建 API、Web、Worker 镜像，再启动容器；PostgreSQL、Redis、MinIO、Mailpit 和 Nginx 也由 Compose 编排。
- 这仍不是成熟的 CI/CD 镜像发布模式。后续可升级为“CI 构建并推送版本化镜像，虚拟机只拉取镜像并回滚”。
- 当前不把真实环境切换到 Kubernetes。实际运行先保持 Ubuntu VM + Docker Compose，Kubernetes 使用 Docker Desktop Kubernetes、kind 或 k3d 单独练习。
- Kubernetes 学习顺序：无状态 API/Web → Deployment/Service → ConfigMap/Secret → readiness/liveness 探针 → Ingress → 滚动更新与回滚。数据库、Redis、MinIO 暂不迁入学习集群。
