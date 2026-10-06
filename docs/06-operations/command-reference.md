# 部署命令速查与注释

> 本文是命令索引，不替代 Windows、Ubuntu VM 和 Kubernetes 的完整部署手册。执行前先确认命令适用的环境。

## 环境标记

- `[WIN]`：Windows PowerShell。
- `[VM]`：Ubuntu 虚拟机 Bash。
- `[K8S]`：Windows PowerShell 中执行 kubectl。

## Windows / Docker Compose

```powershell
[WIN] docker version # 检查 Docker 客户端和服务端是否都可用
[WIN] docker compose version # 检查 Compose Plugin
[WIN] docker ps # 查看正在运行的容器
[WIN] docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml ps # 查看本地 Compose 服务状态
[WIN] docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml logs --tail=100 api # 查看 API 最近日志
[WIN] docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml up -d # 后台启动服务
[WIN] docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml down # 停止服务但保留 volume
[WIN] docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml down -v # 危险：连同数据卷一起删除
```

## Ubuntu VM / Docker Compose

```bash
[VM] sudo systemctl status docker --no-pager # 查看 Docker Engine 服务状态
[VM] sudo systemctl enable --now docker # 设置开机启动并立即启动 Docker
[VM] docker ps # 查看运行中的容器
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml config --quiet # 检查 Compose 配置和变量
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml build --pull # 拉取基础镜像补丁并构建应用镜像
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml up -d # 后台启动完整部署
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps # 查看服务和健康状态
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 api # 查看 API 日志
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml exec api sh # 进入正在运行的 API 容器
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml run --rm api <命令> # 临时启动 API 镜像执行一次性命令
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml down # 停止容器但保留数据卷
[VM] docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml down -v # 危险：删除数据库、Redis、MinIO 数据卷
```

## Linux 系统排查

```bash
[VM] ip -br addr # 查看网卡和 IP
[VM] ss -lntp # 查看监听端口和对应进程
[VM] sudo ufw status verbose # 查看防火墙规则
[VM] df -h / # 查看磁盘空间
[VM] free -h # 查看内存空间
[VM] sudo journalctl -u docker --since '30 minutes ago' --no-pager # 查看 Docker 服务最近日志
```

## Kubernetes

```powershell
[K8S] kubectl config current-context # 查看当前集群上下文
[K8S] kubectl get nodes # 查看节点是否 Ready
[K8S] kubectl get pods -A # 查看所有 namespace 的 Pod
[K8S] kubectl get deployment,service # 查看当前 namespace 的部署和服务
[K8S] kubectl describe pod <pod名称> # 查看 Pod 事件和配置
[K8S] kubectl logs <pod名称> --tail=100 # 查看 Pod 最近日志
[K8S] kubectl get events --sort-by=.lastTimestamp # 按时间查看事件
[K8S] kubectl rollout status deployment/<名称> # 等待滚动发布完成
[K8S] kubectl rollout undo deployment/<名称> # 回滚到上一个版本
[K8S] kubectl delete pod <pod名称> # 删除 Pod；Deployment 管理的 Pod 会自动恢复
[K8S] kubectl delete -f <清单文件> # 删除清单文件创建的资源
```

## 健康检查

```powershell
[WIN] Invoke-WebRequest http://127.0.0.1:3000/api/health/live # 本地开发 API 存活检查
[WIN] Invoke-WebRequest http://127.0.0.1:3000/api/health/ready # 本地开发 API 就绪检查
```

```bash
[VM] curl -i http://127.0.0.1/api/health/live # 通过 Nginx 检查虚拟机 API 存活
[VM] curl -i http://127.0.0.1/api/health/ready # 通过 Nginx 检查虚拟机 API 就绪
```

## 危险操作原则

1. `down -v` 会删除 Docker 数据卷，不是普通重启命令。
2. `kubectl delete namespace` 会删除该 namespace 内所有资源。
3. `docker system prune` 可能删除未使用镜像和缓存，执行前必须确认。
4. 修改生产 `.env.vm` 前先备份并记录当前版本。
5. 任何恢复操作先确认备份文件可读取，不能只看文件名。
