# Worker 服务说明

`apps/worker` 是预留的异步任务服务。Phase 1 的核心公开站点和管理员需求流程不依赖它。

## 检查

```powershell
pnpm --filter @orderlydesk/worker typecheck
pnpm --filter @orderlydesk/worker test
pnpm --filter @orderlydesk/worker build
```

部署时由 `infra/docker/compose.vm.yml` 统一管理。只有在实际启用异步邮件、媒体处理或其他后台任务后，才增加业务 worker 配置。
