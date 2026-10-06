# Windows 本地开发：从零开始

> 适用范围：Windows 10/11 + Docker Desktop + PowerShell。
>
> 本文目标：从一台没有开发环境的 Windows 电脑开始，安装工具、下载项目、启动依赖、执行数据库迁移、启动 API/Web，并完成验收。
>
> 命令默认在 **PowerShell** 中执行。看到“管理员 PowerShell”时，必须右键 PowerShell 选择“以管理员身份运行”。

## 0. 先理解本地运行结构

```text
Windows
├─ Node.js + pnpm       # 启动 API 和 Web 开发服务器
└─ Docker Desktop
   ├─ PostgreSQL        # 业务数据库
   ├─ Redis             # 队列和缓存
   ├─ MinIO             # 对象存储
   └─ Mailpit           # 本地邮件收件箱
```

本地开发不是把 PostgreSQL、Redis 等软件直接安装到 Windows，而是通过 Docker 容器隔离运行。源码仍由 Node.js 开发命令直接运行，便于热更新和调试。

## 1. 电脑和虚拟化检查

建议配置：

- Windows 10 22H2 或 Windows 11 22H2 及以上。
- 4 核 CPU、16 GB 内存、30 GB 以上可用磁盘。
- BIOS/UEFI 已启用 Intel VT-x 或 AMD SVM。
- 当前用户拥有安装软件的权限。

### 1.1 查看 Windows 版本

```powershell
winver # 打开 Windows 版本窗口；确认版本满足上面的最低要求
```

成功标准：弹出“关于 Windows”窗口，并能看到 Windows 版本和内部版本号。

### 1.2 查看虚拟化状态

```powershell
systeminfo # 输出系统信息；在“Hyper-V 要求”区域查看虚拟化是否已启用
```

成功标准：`Virtualization Enabled In Firmware: Yes`。如果是 `No`，需要进入 BIOS/UEFI 开启虚拟化后重启电脑。

## 2. 安装 WSL 2

> 只需执行一次。Docker Desktop 使用 WSL 2 作为 Linux 容器运行后端。

在管理员 PowerShell 中执行：

```powershell
wsl --install # 安装 WSL、默认 Linux 发行版及必要组件
wsl --update # 更新 WSL 内核到当前可用版本
wsl --set-default-version 2 # 让以后安装的 Linux 发行版默认使用 WSL 2
```

成功标准：命令没有红色错误，并且系统提示需要重启时完成重启。

重启后执行：

```powershell
wsl --status # 查看 WSL 默认版本、内核版本和当前状态
wsl -l -v # 列出 Linux 发行版；VERSION 列应为 2
```

常见问题：

- `wsl is not recognized`：先执行 Windows Update，再重新打开管理员 PowerShell。
- `Please enable the Virtual Machine Platform`：在 BIOS 开启虚拟化，并确保 Windows“虚拟机平台”可选功能已启用。

## 3. 下载并安装开发工具

请从官方渠道下载稳定版本：

| 工具               | 用途                                   |
| ------------------ | -------------------------------------- |
| Git for Windows    | 下载源码、查看版本和差异               |
| Node.js 22 LTS     | 运行 TypeScript、NestJS、Vue、Vite     |
| Docker Desktop     | 运行 PostgreSQL、Redis、MinIO、Mailpit |
| Visual Studio Code | 编辑代码和 Markdown 文档               |
| Windows Terminal   | 管理多个 PowerShell 窗口               |

安装时建议：

- Git：启用 Git Bash 和 Windows Credential Manager。
- Node.js：勾选 Add to PATH；npm 会随 Node.js 一起安装。
- Docker Desktop：选择 WSL 2 backend。
- VS Code：安装 `PowerShell`、`ESLint`、`Prettier - Code formatter`、`Vue - Official` 扩展。

安装后关闭所有旧 PowerShell 窗口，再打开新的 PowerShell：

```powershell
git --version # 检查 Git 是否安装成功
node --version # 检查 Node.js 版本；应为 v22.x
npm --version # 检查 npm 是否随 Node.js 可用
docker --version # 检查 Docker CLI 是否可用
docker compose version # 检查 Compose Plugin 是否可用
code --version # 检查 VS Code 命令是否加入 PATH
```

成功标准：每条命令都输出版本号，没有“不是内部或外部命令”的错误。

如果 `docker` 命令不存在：启动 Docker Desktop，等待左下角显示 Docker Engine 正在运行，然后重新打开 PowerShell。

## 4. 验证 Docker Desktop

在 Docker Desktop 启动并显示运行后执行：

```powershell
docker run --rm hello-world # 下载并运行官方测试镜像；验证 Docker 能拉取镜像并启动容器
docker info # 查看 Docker Engine 详细信息；验证客户端能连接到引擎
```

成功标准：`hello-world` 输出 `Hello from Docker!`，并且 `docker info` 能输出 Server 信息。

## 5. 安装 pnpm 11

项目通过 `packageManager` 固定 pnpm 版本。推荐使用 Corepack：

```powershell
corepack enable # 启用 Node.js 自带的包管理器代理
corepack prepare pnpm@11.5.1 --activate # 激活项目使用的 pnpm 版本
pnpm --version # 验证 pnpm 版本；应输出 11.5.1
```

如果 `corepack` 不存在：

```powershell
npm install --global pnpm@11.5.1 # 使用 npm 全局安装指定版本的 pnpm
pnpm --version # 再次确认 pnpm 已加入 PATH
```

## 6. 下载项目源码

如果项目已经存在，直接进入项目目录：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code # 切换到项目根目录；后续命令默认都在这里执行
```

如果需要从 Git 仓库重新下载：

```powershell
New-Item -ItemType Directory -Force D:\Work\JiaFang\saltedFish | Out-Null # 创建源码父目录；已存在时不会报错
git clone <仓库地址> D:\Work\JiaFang\saltedFish\orderlydesk-code # 克隆仓库；把 <仓库地址> 替换成真实 Git 地址
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code # 进入克隆后的项目根目录
```

检查目录：

```powershell
Get-ChildItem package.json,pnpm-workspace.yaml,apps,packages,infra # 确认项目关键文件和目录存在
```

成功标准：能看到 `package.json`、`pnpm-workspace.yaml`、`apps`、`packages`、`infra`。

## 7. 安装依赖

```powershell
pnpm install # 根据 pnpm-lock.yaml 安装所有 workspace 依赖；不要改用 npm install
```

成功标准：命令结束时没有 `ERR_PNPM_` 错误，项目中出现 `node_modules`，并且 lockfile 没有被无故大规模修改。

如果失败：

```powershell
node --version # 重新确认 Node.js 主版本为 22
pnpm --version # 重新确认 pnpm 为 11.5.1
pnpm store path # 查看 pnpm 全局缓存位置；用于排查磁盘或权限问题
```

不要直接删除用户目录下的整个 pnpm store；先修复版本、权限或网络问题。

## 8. 配置本地环境变量

```powershell
Copy-Item infra\docker\.env.local.example infra\docker\.env.local # 复制本地 Compose 示例配置；不会修改示例文件
```

生成一个本机管理员令牌：

```powershell
$bytes = New-Object byte[] 32 # 创建 32 字节随机数缓冲区
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes) # 使用系统安全随机数填充缓冲区
[Convert]::ToBase64String($bytes) # 输出可复制到 ADMIN_TOKEN 的随机令牌
```

编辑 `infra/docker/.env.local`，至少确认：

```text
POSTGRES_USER=orderlydesk
POSTGRES_PASSWORD=orderlydesk_local
POSTGRES_DB=orderlydesk
ADMIN_TOKEN=替换为上一步生成的随机令牌
```

> `.env.local` 只用于本机，不要提交 Git。不要把真实密码或令牌写进文档、截图或工单。

## 9. 启动依赖容器

```powershell
pnpm infra:up # 启动 PostgreSQL、Redis、MinIO、Mailpit；数据保存在 Docker volumes 中
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml ps # 查看容器状态和 healthcheck
```

成功标准：PostgreSQL、Redis、MinIO 显示 `healthy` 或 `Up`，没有反复重启。

查看日志：

```powershell
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml logs --tail=100 postgres # 查看 PostgreSQL 最近 100 行日志
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml logs --tail=100 redis minio mailpit # 查看其他依赖的最近日志
```

本地服务地址：

- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`
- MinIO API：`http://localhost:9000`
- MinIO 控制台：`http://localhost:9001`
- Mailpit：`http://localhost:8025`

## 10. 设置 API 环境变量并执行数据库初始化

在当前 PowerShell 窗口设置 API 使用的连接串：

```powershell
$env:NODE_ENV = 'development' # 指定开发环境
$env:PORT = '3000' # 指定 API 监听端口
$env:API_PREFIX = 'api' # 指定 API 路径前缀
$env:ADMIN_TOKEN = '替换为你的随机令牌' # 设置管理端鉴权令牌；必须与前端登录使用的令牌一致
$env:DATABASE_URL = 'postgresql://orderlydesk:orderlydesk_local@localhost:5432/orderlydesk' # 指定本机数据库连接串
```

执行迁移和种子数据：

```powershell
pnpm --filter @orderlydesk/api db:migrate # 创建或升级数据库表结构；可重复执行，已执行迁移会被跳过
pnpm --filter @orderlydesk/api db:seed # 写入可验收的初始个人资料、服务和作品数据
```

成功标准：迁移命令无报错；seed 命令完成；数据库中能读取初始内容。

## 11. 启动 API 和 Web

打开两个 PowerShell 窗口。每个窗口都先进入项目目录。

窗口 A：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code # 进入项目根目录
pnpm dev:api # 启动 NestJS API 开发服务器；保持窗口打开以持续查看日志
```

窗口 B：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code # 进入项目根目录
pnpm dev:web # 启动 Vite Web 开发服务器；保持窗口打开以支持热更新
```

成功标准：

- API 窗口显示监听 `3000`。
- Web 窗口显示监听 `5173`。
- 两个窗口都没有持续报错或反复退出。

## 12. 验收页面和 API

```powershell
Invoke-WebRequest http://127.0.0.1:3000/api/health/live # 请求存活探针；应返回 HTTP 200
Invoke-WebRequest http://127.0.0.1:3000/api/health/ready # 请求就绪探针；数据库可用时应返回 HTTP 200
Invoke-WebRequest http://127.0.0.1:3000/api/public/content # 请求公开内容；验证 API 能读取已发布数据
```

浏览器打开：

- 公共站点：`http://127.0.0.1:5173`
- 管理端：`http://127.0.0.1:5173/admin/login`
- API 文档：`http://127.0.0.1:3000/api/docs`

验收顺序：

1. 首页能展示个人资料、服务和作品。
2. 公开页面不会展示未发布草稿。
3. 未同意隐私条款时，需求表单不能提交。
4. 提交匿名需求后，管理端能看到需求。
5. 管理端可以修改需求状态和内部备注。
6. 内容草稿保存后，发布校验能明确提示通过或缺少项。

## 13. 停止、重启和清理

停止前台 API/Web：在对应窗口按 `Ctrl+C`。停止基础设施但保留数据：

```powershell
pnpm infra:down # 停止并删除本项目依赖容器；默认保留 PostgreSQL、Redis、MinIO volumes
pnpm infra:up # 再次启动依赖容器；用于验证重启后数据仍在
```

查看 volume：

```powershell
docker volume ls --filter name=orderlydesk # 列出项目相关数据卷；确认数据卷仍存在
```

危险命令：

```powershell
docker compose --env-file infra\docker\.env.local -f infra\docker\compose.local.yml down -v # 停止容器并删除 volumes；会删除本地数据库和对象存储数据
```

只有确认备份可恢复时才执行 `down -v`。

## 14. 本地验证清单

```powershell
pnpm format:check # 检查 Prettier 格式
pnpm lint # 检查 ESLint 规则
pnpm typecheck # 检查 TypeScript/Vue 类型
pnpm test # 运行单元和组件测试
pnpm test:integration # 运行 API 集成测试
pnpm build # 构建生产产物
```

全部命令成功结束，且第 12 节页面验收通过，才算本地环境完成。
