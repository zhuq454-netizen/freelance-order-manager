# 故障排查

## 页面打不开

1. 检查 Web/API/Nginx 状态。
2. 检查端口是否被占用。
3. 检查浏览器访问的 IP 是否是虚拟机当前 IP。

```bash
docker compose ps
ss -lntp
curl -i http://127.0.0.1/api/health/live
```

## API 返回 503

通常表示数据库连接不可用：

```bash
docker compose logs --tail=200 postgres api
```

确认 `DATABASE_URL`、PostgreSQL healthcheck 和容器网络名称正确。不要先删除数据库 volume。

## API 返回 401

管理员请求必须带：

```text
Authorization: Bearer <ADMIN_TOKEN>
```

确认前端登录使用的是当前部署的 `ADMIN_TOKEN`，不要把令牌写入 URL。

## 迁移失败

- 确认 PostgreSQL 已 healthy。
- 确认连接串用户名、密码、数据库名和主机名正确。
- 检查是否重复执行了手工 SQL。
- 保存错误日志后再处理，不要直接 `down -v`。

## 端口冲突

Windows：

```powershell
Get-NetTCPConnection -LocalPort 5432,6379,9000,9001,8025 -ErrorAction SilentlyContinue
```

Ubuntu：

```bash
sudo ss -lntp | grep -E ':80|:5432|:6379|:9000|:9001'
```

## 虚拟机无法从宿主机访问

确认：

- 虚拟机网卡为 Host-only 或桥接模式。
- 宿主机与虚拟机位于同一网段。
- Ubuntu 防火墙允许 80/tcp 和 SSH。
- Nginx 容器已启动。

## 日志收集

```bash
docker compose logs --since=30m api web nginx postgres redis
```

日志中不要公开 ADMIN_TOKEN、数据库密码或客户联系方式。
