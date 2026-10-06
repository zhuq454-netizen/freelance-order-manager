# Ubuntu 虚拟机部署：从零开始

> 目标：在一台全新的 Ubuntu 24.04 LTS 虚拟机中部署 OrderlyDesk。
>
> 重要结论：当前方案不是在虚拟机里直接运行源码，而是“源码驱动的 Docker 镜像部署”。虚拟机获取源码后，Dockerfile 构建 API/Web/Worker 镜像，Docker Compose 启动全部容器。
>
> 命令执行位置：除非特别注明，本文命令都在 **Ubuntu 虚拟机终端**执行；Windows 命令只在宿主机 PowerShell 执行。

## 0. 部署结构

```text
Windows 宿主机
└─ Ubuntu 24.04 虚拟机
   ├─ Docker Engine + Docker Compose Plugin
   └─ Docker Compose
      ├─ nginx       # 80 端口入口
      ├─ web         # 前端静态站点
      ├─ api         # NestJS API
      ├─ worker      # 后台任务
      ├─ postgres    # 数据库
      ├─ redis       # 队列/缓存
      ├─ minio       # 对象存储
      └─ mailpit     # 测试邮件
```

## 1. 创建虚拟机

推荐参数：

- Ubuntu Server 24.04 LTS 64-bit。
- 4 vCPU。
- 8 GB 内存；最低 4 GB。
- 40 GB 动态磁盘；建议 60 GB。
- 网卡：桥接模式，或 Host-only + NAT 双网卡。
- SSH Server：安装器中勾选 OpenSSH Server。

### 1.1 查看虚拟机 IP

在 Ubuntu 虚拟机执行：

```bash
ip -br addr # 查看网卡和 IPv4 地址；找到类似 192.168.x.x 的地址
hostname -I # 只输出当前虚拟机 IP；记录下来供 Windows 浏览器访问
```

成功标准：虚拟机获得稳定的局域网 IP。若只有 `127.0.0.1`，说明网卡或 DHCP 未配置成功。

### 1.2 从 Windows 测试 SSH

在 Windows PowerShell 执行：

```powershell
Test-NetConnection 192.168.56.10 -Port 22 # 测试宿主机到虚拟机 SSH 端口；把 IP 换成实际地址
ssh <ubuntu用户名>@192.168.56.10 # 通过 SSH 登录虚拟机；首次连接会询问主机指纹
```

成功标准：`TcpTestSucceeded : True`，并能进入 Ubuntu shell。

## 2. 更新 Ubuntu 并安装基础工具

```bash
sudo apt update # 更新软件包索引；不会升级已安装软件
sudo apt upgrade -y # 安装系统安全更新；-y 自动确认
sudo apt install -y ca-certificates curl git gnupg lsb-release unzip jq # 安装证书、下载、Git、密钥和排查工具
sudo timedatectl set-timezone Asia/Shanghai # 设置时区；日志和备份时间统一为中国标准时间
```

成功标准：每条命令返回码为 0，且没有 `E:` 开头的 apt 错误。

查看系统信息：

```bash
lsb_release -a # 查看 Ubuntu 版本；应为 24.04 LTS
uname -a # 查看内核和 CPU 架构；通常应为 x86_64
free -h # 查看内存；确认有足够空间运行多个容器
df -h / # 查看根分区剩余磁盘；建议至少保留 15 GB
```

## 3. 安装 Docker Engine 和 Compose Plugin

> 这部分是官方的，在国内用不了这个镜像源，参考下面文档
```bash
E:\Learning\CloudComputing\阶段2\老师笔记\03 容器docker\docker教案\ubuntu24.04LTS部署docker.md
```
> 这里不是“下载 Docker 源码自行编译”。使用 Docker 官方 apt 软件源安装预编译 Docker Engine 和 Compose Plugin。

删除可能冲突的旧包：

```bash
sudo apt remove -y docker.io docker-doc docker-compose podman-docker containerd runc # 移除 Ubuntu/旧版本冲突包；不会删除 /var/lib/docker 中的数据卷
```

添加 Docker 官方仓库：

```bash
sudo install -m 0755 -d /etc/apt/keyrings # 创建保存仓库签名密钥的目录
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc # 下载 Docker 官方 GPG 公钥
sudo chmod a+r /etc/apt/keyrings/docker.asc # 允许 apt 读取公钥
printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n' "$(dpkg --print-architecture)" "$(. /etc/os-release && echo "$VERSION_CODENAME")" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null # 写入 Docker 官方 apt 源
sudo apt update # 让 apt 读取新添加的 Docker 软件源
```

安装 Docker：

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin # 安装 Docker 引擎、运行时、Buildx 和 Compose Plugin
sudo systemctl enable --now docker # 设置 Docker 开机启动并立即启动服务
sudo docker run --rm hello-world # 下载并运行测试镜像；验证 Docker 能拉取和启动容器
sudo docker compose version # 验证 Compose Plugin 已安装
```

成功标准：

- `hello-world` 输出 `Hello from Docker!`。
- `docker compose version` 输出 Compose 版本。
- `systemctl is-active docker` 输出 `active`。

让当前用户免 sudo 使用 Docker：

```bash
sudo usermod -aG docker "$USER" # 把当前用户加入 docker 用户组
exit # 退出当前 SSH 会话；让用户组变更生效
```

重新 SSH 登录后验证：

```bash
docker ps # 查看容器列表；不应再要求输入 sudo 密码
docker info # 查看 Docker Engine；确认客户端可连接服务端
```

> 上面是docke的部署验证操作

## 4. 配置防火墙

先确认 SSH 可用，再启用 UFW：

```bash
sudo ufw allow OpenSSH # 放行 SSH 22/tcp，避免启用防火墙后无法登录
sudo ufw allow 80/tcp # 放行 Nginx HTTP 入口
sudo ufw enable # 启用 UFW；会询问确认
sudo ufw status verbose # 查看生效规则
```

成功标准：状态为 `active`，且存在 `22/tcp` 和 `80/tcp` 规则。

不要开放数据库端口到局域网：PostgreSQL、Redis、MinIO 由 Compose 内部网络通信，通常不需要 `5432`、`6379`、`9000`、`9001` 入站规则。

## 5. 下载项目源码

```bash
sudo mkdir -p /opt/orderlydesk # 创建部署目录；统一放置项目文件
sudo chown -R "$USER":"$USER" /opt/orderlydesk # 把目录交给当前部署用户，避免后续 Git 和 Docker 构建权限问题
cd /opt/orderlydesk # 进入部署目录
```

首次部署：

```bash
git clone <仓库地址> orderlydesk-code # 克隆源码；把 <仓库地址> 替换成真实仓库地址
cd /opt/orderlydesk/orderlydesk-code # 进入项目根目录
```

已有代码更新：

```bash
cd /opt/orderlydesk/orderlydesk-code # 进入现有项目目录
git status --short # 先查看是否有本地改动，避免 pull 覆盖未保存内容
git pull --ff-only # 只允许快进更新；出现分叉时停止并人工处理
```

成功标准：

```bash
test -f package.json && test -f infra/docker/compose.vm.yml && echo '项目文件检查通过' # 检查部署所需关键文件
```

## 6. 配置虚拟机环境变量

```bash
cp infra/docker/.env.vm.example infra/docker/.env.vm # 复制虚拟机配置模板；保留示例文件作为参考
chmod 600 infra/docker/.env.vm # 限制环境变量文件只有当前用户可读写
```

生成随机密码和管理员令牌：

```bash
openssl rand -base64 32 # 生成 PostgreSQL/MinIO 等服务可使用的随机密码
openssl rand -hex 32 # 生成 ADMIN_TOKEN；复制输出到 .env.vm
```

编辑文件：

```bash
nano infra/docker/.env.vm # 打开虚拟机环境变量；按 Ctrl+O 保存，Enter 确认，Ctrl+X 退出
```

至少修改：

```text
POSTGRES_PASSWORD=随机数据库密码
MINIO_ROOT_PASSWORD=随机MinIO密码
ADMIN_TOKEN=随机管理员令牌
PUBLIC_APP_URL=http://虚拟机IP
```

检查敏感配置是否存在，但不要把令牌输出到终端：

```bash
test -s infra/docker/.env.vm && grep -q '^ADMIN_TOKEN=' infra/docker/.env.vm && echo '环境变量文件检查通过' # 检查文件非空且包含管理员令牌键
```

## 7. 检查 Compose 配置

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml config --quiet # 解析 Compose、变量和依赖；无输出且返回 0 表示通过
```

如果失败：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml config # 输出展开后的配置；用于定位变量缺失或 YAML 错误
```

不要把完整展开结果复制到公开工单，因为它可能包含密码和连接串。

## 8. 构建镜像并启动服务

当前 Compose 使用仓库中的 Dockerfile 构建镜像：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml build --pull # 拉取基础镜像最新补丁并构建 API/Web/Worker；首次可能需要较长时间
```

成功标准：构建结束没有 `failed to solve`、`npm/pnpm install failed` 或磁盘不足错误。

启动服务：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml up -d # 后台启动所有服务；-d 表示终端不会被日志占用
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps # 查看容器状态、端口和健康状态
```

成功标准：

- `postgres`、`redis`、`minio`、`api` 为 `healthy` 或正常运行。
- `minio-init` 成功退出，不应反复重启。
- `nginx` 映射 `0.0.0.0:80->80/tcp`。

## 9. 执行数据库迁移和初始化数据

在 API 容器中执行迁移：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml run --rm api pnpm --filter @orderlydesk/api db:migrate # 临时启动 API 镜像执行迁移，完成后自动删除临时容器
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml run --rm api pnpm --filter @orderlydesk/api db:seed # 写入初始个人资料、服务和作品数据，完成后自动删除临时容器
```

成功标准：两条命令都返回 0；再次执行迁移不会重复创建同一批迁移。

如果迁移失败，先查看：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 postgres # 查看数据库启动和认证日志
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 api # 查看 API/迁移错误
```

## 10. 验证服务

在 Ubuntu 虚拟机内部验证：

```bash
curl -i http://127.0.0.1/api/health/live # 检查 Nginx 到 API 的存活探针；预期 HTTP/1.1 200
curl -i http://127.0.0.1/api/health/ready # 检查数据库等依赖是否就绪；预期 HTTP 200
curl -i http://127.0.0.1/api/public/content # 检查公开内容接口；预期能返回已发布内容
```

在 Windows 宿主机浏览器访问：

- `http://虚拟机IP/`
- `http://虚拟机IP/admin/login`

成功标准：

1. 首页展示个人资料、服务和作品。
2. 需求表单能提交匿名需求。
3. 管理端使用 `ADMIN_TOKEN` 登录后能看到需求。
4. 管理端可以修改状态和内部备注。
5. API 和 Web 容器没有反复重启。

## 11. 日常运维命令

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps # 查看所有服务状态
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=100 api # 查看 API 最近 100 行日志
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs -f nginx # 持续查看 Nginx 日志；Ctrl+C 只退出日志查看，不会停止容器
docker stats # 查看容器 CPU、内存和网络使用
df -h / # 查看磁盘剩余空间；镜像和日志会占用磁盘
```

## 12. 重启恢复验证

```bash
sudo reboot # 重启 Ubuntu；SSH 会断开，等待约 1 分钟后重新连接
```

重新登录后：

```bash
systemctl is-active docker # 确认 Docker 已自动启动；预期 active
docker compose --env-file /opt/orderlydesk/orderlydesk-code/infra/docker/.env.vm -f /opt/orderlydesk/orderlydesk-code/infra/docker/compose.vm.yml ps # 确认 Compose 容器已恢复
docker volume ls # 确认 postgres-data、redis-data、minio-data 数据卷仍存在
```

## 13. PostgreSQL 备份

```bash
mkdir -p /opt/orderlydesk/backups # 创建备份目录；备份与源码分开保存
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "/opt/orderlydesk/backups/orderlydesk-$(date +%Y%m%d-%H%M%S).dump" # 导出数据库压缩备份
ls -lh /opt/orderlydesk/backups # 查看备份文件大小和时间
```

> 由于 Compose 文件中的变量不一定自动进入当前 shell，上面的 `POSTGRES_USER` 可能为空。若为空，请从 `.env.vm` 读取实际用户名，或使用 `-U orderlydesk -d orderlydesk`。备份完成后必须复制到虚拟机之外。

## 14. 停止与危险清理

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml down # 停止并删除容器，但保留数据卷；用于维护或升级
```

危险命令：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml down -v # 同时删除数据卷；会删除数据库、Redis 和 MinIO 数据，除非确认备份可恢复，否则禁止执行
```

## 15. 常见故障

### Docker 命令不存在

```bash
command -v docker # 检查 Docker 可执行文件是否在 PATH
sudo systemctl status docker --no-pager # 查看 Docker 服务状态
```

重新安装 Docker Engine 或启动服务，不要先删除项目数据。

### API 返回 503

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps # 查看 postgres/redis/api 是否 healthy
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 postgres api # 查看数据库和 API 错误
```

优先检查 `.env.vm` 密码、数据库名、容器健康状态和迁移是否完成。

### Windows 无法访问虚拟机

```bash
ip -br addr # 确认虚拟机 IP 是否变化
sudo ufw status # 确认 80/tcp 已放行
curl -i http://127.0.0.1/ # 确认服务在虚拟机内部可访问
```

如果虚拟机内部正常而 Windows 不通，检查网卡模式、宿主机与虚拟机是否同网段以及 Windows 防火墙。

### 磁盘不足

```bash
df -h / # 查看根分区使用率
docker system df # 查看镜像、容器和构建缓存占用
```

只清理确认不再需要的构建缓存：

```bash
docker builder prune # 删除未使用的构建缓存；执行前阅读提示，不会删除运行中的容器
```

## 16. 完成标准

- Docker Engine 和 Compose Plugin 通过安装验证。
- Compose 配置检查返回 0。
- API/Web/Worker/数据库容器正常运行。
- `health/live` 和 `health/ready` 返回 HTTP 200。
- Windows 浏览器可以访问虚拟机 IP。
- 匿名需求可提交，管理员可查看和处理。
- 重启虚拟机后数据仍存在。
- 已执行数据库备份，并将备份复制到虚拟机之外。
