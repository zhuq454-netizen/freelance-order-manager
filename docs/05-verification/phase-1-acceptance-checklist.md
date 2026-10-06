# Phase 1 综合验收清单

本清单是当前 OrderlyDesk Phase 1 的唯一业务验收入口。部署前先完成 Windows 或 Ubuntu 虚拟机部署手册，再执行本清单。

## 文档和范围

- [ ] 已阅读 `docs/README.md`。
- [ ] 已阅读 `docs/04-deployment/windows-local-deployment.md` 或 `docs/04-deployment/vm-linux-deployment.md`。
- [ ] 公开页面、管理页面、API 契约和数据库范围与 Phase 1 一致。
- [ ] 未把客户账号、多服务商、支付、评价、聊天、自动报价、完整订单/财务流程加入本阶段。

## 安装和代码质量

- [ ] Node.js 22 和 pnpm 11 可用。
- [ ] Docker/Compose 可用。
- [ ] `pnpm install` 通过。
- [ ] `pnpm lint` 通过且无 error。
- [ ] `pnpm typecheck` 通过。
- [ ] `pnpm test` 通过。
- [ ] `pnpm test:integration` 通过。
- [ ] `pnpm build` 通过。

## 数据库和基础设施

- [ ] PostgreSQL healthy。
- [ ] Redis healthy。
- [ ] MinIO healthy，私有 bucket 已创建。
- [ ] Mailpit 或生产 SMTP 配置正确。
- [ ] migration 成功。
- [ ] seed 成功。
- [ ] PostgreSQL 备份已生成并复制到应用主机之外。

## 公共站点

- [ ] 首页展示个人资料、定位和服务入口。
- [ ] 服务列表/详情只显示 `published` 内容。
- [ ] 项目列表/详情只显示 `published` 内容。
- [ ] 草稿、归档和不存在 slug 不会出现在公开接口或页面。
- [ ] 匿名需求表单校验必填项、联系方式和同意项。
- [ ] 需求提交成功后不回显客户联系方式、内部备注、审计字段或原始附件。
- [ ] 1440px、1024px、768px、375px 下无横向溢出。
- [ ] 键盘焦点、减少动画、图片替代文本符合设计要求。

## 管理端

- [ ] 无 Bearer Token 访问管理 API 返回 `401`。
- [ ] 正确 Token 可以登录管理端。
- [ ] 管理员可查看需求列表和详情。
- [ ] 管理员可修改需求状态。
- [ ] 管理员可添加内部备注。
- [ ] 状态和备注变更写入审计记录。
- [ ] 管理员可读取/保存内容草稿。
- [ ] 发布校验能阻止服务或项目均未发布的情况。
- [ ] 管理端错误不会误报“已保存”或“已发布”。

## API 和安全边界

- [ ] `/api/health/live` 返回 HTTP 200。
- [ ] `/api/health/ready` 返回 HTTP 200。
- [ ] `/api/public/content` 返回公开资料、服务和项目。
- [ ] `/api/public/inquiries` 对非法请求返回 400，对数据库不可用返回 503。
- [ ] `/api/admin/*` 不携带凭据返回 401。
- [ ] 公开响应不包含 `contactValue`、`notes`、`auditEvents` 等私有字段。
- [ ] `ADMIN_TOKEN`、数据库密码、MinIO 密钥不进入前端构建产物。
- [ ] PostgreSQL、Redis、MinIO 不直接暴露到公网。

## 发布记录

- 日期：2026-10-03
- 版本：
- 环境：Windows / Ubuntu VM
- 操作系统：
- Node.js / pnpm / Docker 版本：
- 数据库备份路径：
- 验收人：
- 遗留问题：
