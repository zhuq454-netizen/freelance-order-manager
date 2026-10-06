# Windows 本地开发环境

适用于 Windows 10/11、PowerShell、Docker Desktop 和 Node.js。本文只描述 Windows 本地开发环境；Linux 虚拟机请阅读 `docs/04-deployment/vm-linux-deployment.md`。

## 0. 本地运行结构

Windows 上直接运行 Node.js 的 API 和 Web 开发服务器；PostgreSQL、Redis、MinIO、Mailpit 通过 Docker Desktop 容器运行。

本地数据库与 Linux 虚拟机数据库相互独立。本文所有 `localhost` 均指 Windows 本机。

## 1. 必需工具

检查 PowerShell 中的版本：

```powershell
git --version
node --version
npm --version
pnpm --version
docker --version
docker compose version
code --version
```

项目要求：Node.js 22 或 24、pnpm 11、Docker Desktop 使用 Linux containers/WSL 2。Docker Engine 未启动时，先打开 Docker Desktop，直到 `docker info` 能显示 Server 信息。

如果尚未安装 WSL 2，请在管理员 PowerShell 执行：

```powershell
wsl --install
wsl --update
wsl --set-default-version 2
```

执行后按系统提示重启，并确认：

```powershell
wsl --status
wsl -l -v
```

## 2. 进入项目并安装依赖

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code
pnpm install
```

`pnpm install` 会按照 `pnpm-lock.yaml` 安装 workspace 依赖。不要改用 `npm install`，也不要为本地开发删除 lockfile。

如需把 pnpm 缓存放到指定磁盘：

```powershell
pnpm config set store-dir E:\Development\pnpm-store
pnpm store path
```

## 3. 配置本地环境文件

首次配置时复制示例文件：

```powershell
Copy-Item infra\docker\.env.local.example infra\docker\.env.local
```

编辑 `infra/docker/.env.local`，确认本地数据库配置：

```text
POSTGRES_USER=orderlydesk
POSTGRES_PASSWORD=orderlydesk_local
POSTGRES_DB=orderlydesk
ADMIN_TOKEN=请替换为本地随机令牌
```

`.env.local` 只用于 Windows 本地环境，不要提交到 Git，也不要复制到 Linux 虚拟机。

## 4. 启动本地依赖

```powershell
pnpm infra:up
```

该命令启动 PostgreSQL、Redis、MinIO 和 Mailpit，并保留数据在 Docker volumes 中。检查状态：

```powershell
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml ps
```

常用地址：

- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`
- MinIO API：`http://localhost:9000`
- MinIO 控制台：`http://localhost:9001`
- Mailpit：`http://localhost:8025`

## 5. 执行数据库迁移和种子数据

第一次配置本地数据库时，必须先迁移，再 seed：

```powershell
$env:DATABASE_URL = 'postgresql://orderlydesk:orderlydesk_local@localhost:5432/orderlydesk'
pnpm --filter @orderlydesk/api db:migrate
pnpm --filter @orderlydesk/api db:seed
```

- `db:migrate` 创建或升级表结构，可重复执行。
- `db:seed` 写入本地开发和验收所需的初始资料、服务和作品数据。
- 以后只重启容器且没有删除 volume 时，不需要重复 seed。
- 新增数据库 migration 后，需要再次执行 `db:migrate`。

不要在 Windows 本地使用虚拟机的数据库连接串；两个环境的数据库完全独立。

## 6. 启动 API 和 Web

分别打开两个 PowerShell 窗口，都进入项目根目录。

窗口 A：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code
$env:NODE_ENV = 'development'
$env:PORT = '3000'
$env:API_PREFIX = 'api'
$env:DATABASE_URL = 'postgresql://orderlydesk:orderlydesk_local@localhost:5432/orderlydesk'
pnpm dev:api
```

窗口 B：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code
pnpm dev:web
```

访问地址：

- Web：`http://127.0.0.1:5173`
- 管理端：`http://127.0.0.1:5173/admin/login`
- API 文档：`http://127.0.0.1:3000/api/docs`

## 7. 验收

```powershell
Invoke-WebRequest http://127.0.0.1:3000/api/health/live
Invoke-WebRequest http://127.0.0.1:3000/api/health/ready
Invoke-WebRequest http://127.0.0.1:3000/api/public/content
```

API 应监听 3000，Web 应监听 5173。页面能够显示 seed 写入的初始内容，即表示本地环境基本可用。

可选的项目检查：

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 8. 停止和清理

停止容器但保留数据库数据：

```powershell
pnpm infra:down
```

重新启动：

```powershell
pnpm infra:up
```

只有确认不需要本地数据时，才执行以下命令。`down -v` 会删除 PostgreSQL、MinIO 等 volumes 中的数据：

```powershell
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml down -v
```
