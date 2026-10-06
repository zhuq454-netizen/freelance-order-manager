# 回滚

## 应用版本回滚

1. 停止发布流程，不要删除数据库卷。
2. 切换到已验证的代码版本。
3. 重新构建 API/Web 镜像。
4. 启动服务并检查 health/live。
5. 运行公开内容和管理员登录验收。

```bash
git fetch --tags
git checkout <已验证版本>
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml build api web worker
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml up -d
```

## 数据库回滚

优先使用向前兼容 migration。只有经过备份验证并确认影响范围时，才使用 PostgreSQL 备份恢复，步骤见 `backup-and-restore.md`。

## 回滚后必须验证

- `/api/health/live` 返回 200。
- `/api/public/content` 不返回草稿或归档内容。
- 管理员能登录。
- 需求列表、状态和备注正常。
- Web 页面没有静态资源 404。
