# 数据库迁移和种子数据

本文说明数据库结构和初始数据如何在不同环境中初始化。

Windows 本地开发和 Linux 虚拟机部署都需要执行迁移，但两者使用的是**完全独立的 PostgreSQL 数据库**：

- Windows 本地使用 Docker Desktop 中的 PostgreSQL，以及 `infra/docker/.env.local`。
- Linux 虚拟机使用虚拟机中的 PostgreSQL，以及 `infra/docker/.env.vm`。
- 两个环境的数据库、数据卷、端口和数据不会自动同步。

## 相关文件

- 数据库结构定义：`apps/api/src/database/schema.ts`
- 迁移文件：`apps/api/drizzle/`
- 迁移脚本：`apps/api/scripts/migrate.ts`
- 种子数据脚本：`apps/api/scripts/seed.ts`

## 先理解两个命令

### `db:migrate`：创建或升级表结构

迁移会根据 `apps/api/drizzle/` 中尚未执行的 migration，创建表、字段、索引等数据库结构。

它可以重复执行。已经执行过的 migration 会被记录并自动跳过，不会重复创建表。

新增数据库字段或表时，应新增 migration，然后在目标环境执行 `db:migrate`。不要直接修改已经执行过的历史 migration 文件。

### `db:seed`：写入初始演示数据

seed 会写入项目用于开发和验收的个人资料、服务、作品等初始内容。它不是数据库结构初始化的替代品，所以必须先执行 `db:migrate`。

seed 脚本应保持可重复执行。不要把真实客户数据、生产密码或生产令牌写入 seed 文件。

## Windows 本地开发环境

### 何时执行

第一次配置本地环境时，需要按顺序执行：

1. 启动本地 PostgreSQL 容器。
2. 执行数据库迁移。
3. 写入种子数据。

以后如果只是重新启动容器，且没有删除数据库 volume，通常不需要重新执行 seed。新增 migration 后，需要再次执行 `db:migrate`。

### 执行位置

以下命令在 Windows PowerShell 中执行，并且当前目录应为项目根目录：

```powershell
Set-Location D:\Work\JiaFang\saltedFish\orderlydesk-code
```

### 启动本地数据库

```powershell
pnpm infra:up
```

这会启动本地 PostgreSQL、Redis、MinIO 和 Mailpit。数据库连接信息来自 `infra/docker/.env.local`。

### 设置本地数据库连接串

```powershell
$env:DATABASE_URL = 'postgresql://orderlydesk:orderlydesk_local@localhost:5432/orderlydesk'
```

这个连接串中的 `localhost` 指向 Windows 本机上的 Docker 端口映射，不是 Linux 虚拟机。

### 执行迁移和种子数据

```powershell
# 创建或升级本地数据库表结构
pnpm --filter @orderlydesk/api db:migrate

# 写入本地开发和验收所需的初始数据
pnpm --filter @orderlydesk/api db:seed
```

### 验证本地数据库

先查看实际的容器名称：

```powershell
docker compose --env-file infra/docker/.env.local -f infra/docker/compose.local.yml ps
```

然后使用实际的 PostgreSQL 容器名称执行查询。容器名称可能因 Compose 版本或项目目录不同而变化：

```powershell
docker exec -it <postgres容器名称> psql -U orderlydesk -d orderlydesk -c '\dt'
docker exec -it <postgres容器名称> psql -U orderlydesk -d orderlydesk -c 'select count(*) from services;'
```

## Linux 虚拟机部署环境

### 何时执行

第一次部署虚拟机时，需要按顺序执行：

1. 启动虚拟机中的 PostgreSQL 容器。
2. 在 API 容器中执行数据库迁移。
3. 在 API 容器中执行种子数据脚本。

发布包含新数据库结构的版本时，也需要先执行 `db:migrate`，再启动或切换到新版本的 API 服务。

### 执行位置

以下命令在 Linux 虚拟机 Shell 中执行，并且当前目录应为项目根目录：

```bash
cd /path/to/orderlydesk-code
```

### 启动虚拟机服务

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml up -d
```

这里使用的是虚拟机配置 `.env.vm` 和 `compose.vm.yml`，不要替换成本地开发使用的 `.env.local` 或 `compose.local.yml`。

### 执行迁移和种子数据

迁移命令会临时启动 API 容器，执行完成后自动删除该临时容器；数据库数据仍保存在 PostgreSQL volume 中：

```bash
# 创建或升级虚拟机数据库表结构
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml run --rm api pnpm --filter @orderlydesk/api db:migrate

# 写入虚拟机部署所需的初始数据
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml run --rm api pnpm --filter @orderlydesk/api db:seed
```

### 验证迁移结果

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps
```

成功标准：迁移和 seed 命令都返回退出码 `0`，PostgreSQL 容器处于运行或 healthy 状态，再次执行迁移不会重复创建同一批 migration。

如果失败，先查看 PostgreSQL 和 API 日志：

```bash
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 postgres
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml logs --tail=200 api
```

## 常见误区

- 不要在 Windows 上使用虚拟机数据库的 `localhost`；每个环境的 `localhost` 都指向当前环境自己。
- 不要把 `.env.local` 用于虚拟机，也不要把 `.env.vm` 用于 Windows 本地开发。
- 不要只执行 `db:seed` 而跳过 `db:migrate`。
- 不要因为迁移失败就直接执行 `docker compose down -v`；这会删除数据库 volume 和其中的数据。
- 生产环境执行迁移前，应先备份 PostgreSQL，并保存完整的错误日志。
- `db:seed` 写入的是演示或初始数据；生产环境是否执行 seed，应根据项目发布策略决定。
