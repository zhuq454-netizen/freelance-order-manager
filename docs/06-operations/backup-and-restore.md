# 备份与恢复

## PostgreSQL 备份

### Windows Docker

```powershell
New-Item -ItemType Directory -Force .\backups | Out-Null
docker exec orderlydesk-local-postgres-1 pg_dump -U orderlydesk -d orderlydesk -Fc > .\backups\orderlydesk-$(Get-Date -Format yyyyMMdd-HHmmss).dump
Get-ChildItem .\backups
```

### Ubuntu 虚拟机

```bash
mkdir -p /opt/orderlydesk/backups
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > /opt/orderlydesk/backups/orderlydesk-$(date +%Y%m%d-%H%M%S).dump
ls -lh /opt/orderlydesk/backups
```

备份完成后复制到虚拟机之外的存储，并记录日期、版本和操作者。

## PostgreSQL 恢复

恢复会覆盖目标数据库，先停止 API/worker 并确认备份文件来源：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml stop api worker
cat /opt/orderlydesk/backups/orderlydesk-YYYYMMDD-HHMMSS.dump | docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists

docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml start api worker
```

## MinIO 备份

MinIO 数据位于 `minio-data` Docker volume。停写后打包 volume 或使用 MinIO Client 同步到外部存储。不要只备份 PostgreSQL 而忽略上传文件。

## 恢复验收

1. API health/live 返回 200。
2. 公开服务和项目数量符合备份前记录。
3. 需求列表和备注可读取。
4. 管理员能修改一条测试需求后再恢复原状态。
5. MinIO 对象仍可访问，媒体链接没有大面积失效。
