# OrderlyDesk 根目录说明

OrderlyDesk 是个人接单平台的 Phase 1 实现：公开展示服务与作品，接收匿名合作需求，并由单管理员在后台推进需求和维护内容。

## 技术栈

- pnpm workspace、Node.js 22、TypeScript
- Vue 3、Vite、Tailwind CSS
- NestJS、Zod、OpenAPI、Drizzle ORM
- PostgreSQL 16、Redis 7、MinIO、Mailpit
- Docker Compose、Nginx

## 先看哪里

- 完整文档入口：`docs/README.md`
- Windows 从零部署：`docs/04-deployment/windows-local-deployment.md`
- Ubuntu 虚拟机部署：`docs/04-deployment/vm-linux-deployment.md`
- 发布验收：`docs/05-verification/phase-1-release-checklist.md`

## 本地开发

```powershell
corepack enable
corepack prepare pnpm@11.5.1 --activate
pnpm install
pnpm infra:up
pnpm --filter @orderlydesk/api db:migrate
pnpm --filter @orderlydesk/api db:seed
pnpm dev:api
pnpm dev:web
```

浏览器访问 `http://127.0.0.1:5173`，API 健康检查为 `http://127.0.0.1:3000/api/health/live`。

## 全量验证

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Phase 1 不实现客户账号、多服务商入驻、支付、评价、实时聊天、正式报价/订单/财务系统。
