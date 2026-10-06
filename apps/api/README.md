# API 服务说明

`apps/api` 是 OrderlyDesk 的 NestJS API 服务，负责公开内容、匿名需求、管理员需求管理和内容草稿管理。

## 常用命令

```powershell
pnpm --filter @orderlydesk/api typecheck
pnpm --filter @orderlydesk/api test
pnpm --filter @orderlydesk/api test:e2e
pnpm --filter @orderlydesk/api build
pnpm --filter @orderlydesk/api db:migrate
pnpm --filter @orderlydesk/api db:seed
```

## 环境变量

开发和部署变量见 `docs/03-development/environment-variables.md`。生产环境必须设置 `ADMIN_TOKEN` 和 `DATABASE_URL`。

## API 路径

- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/public/content`
- `GET /api/public/services`
- `GET /api/public/projects`
- `POST /api/public/inquiries`
- `GET/PATCH /api/admin/inquiries/:id`
- `POST /api/admin/inquiries/:id/notes`
- `GET/PATCH /api/admin/content`
- `POST /api/admin/content/publish`

管理员路径必须携带 `Authorization: Bearer <ADMIN_TOKEN>`。
