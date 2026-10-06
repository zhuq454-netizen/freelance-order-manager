# Web 应用

`apps/web` 是 OrderlyDesk 的 Vue 3 公共站点和管理员工作台。

## 启动

```powershell
pnpm dev:web
```

访问 `http://127.0.0.1:5173`。管理员入口为 `/admin/login`。

## 检查

```powershell
pnpm --filter @orderlydesk/web test
pnpm --filter @orderlydesk/web typecheck
pnpm --filter @orderlydesk/web build
```

公共端允许在 API 不可用时使用 fixture 进行界面预览；真实提交和管理操作必须配置 API 与数据库。
