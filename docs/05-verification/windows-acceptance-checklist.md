# Windows 验收清单

日期：

## 安装

- [ ] Windows 版本符合要求。
- [ ] Git、Node.js 22、pnpm 11、Docker Desktop、VS Code 已安装。
- [ ] WSL 2 和 Docker Desktop hello-world 通过。
- [ ] `pnpm install` 成功。

## 基础设施

- [ ] PostgreSQL healthy。
- [ ] Redis healthy。
- [ ] MinIO API 可访问。
- [ ] Mailpit 可访问。
- [ ] 未使用 `docker compose down -v`。

## 数据库和 API

- [ ] migration 成功。
- [ ] seed 成功。
- [ ] `/api/health/live` 返回 200。
- [ ] `/api/health/ready` 返回 200。
- [ ] `/api/public/content` 返回公开内容。
- [ ] 未授权 `/api/admin/inquiries` 返回 401。
- [ ] 有效管理员令牌可访问后台 API。

## Web

- [ ] 首页、服务、项目页面可打开。
- [ ] 草稿和归档内容不出现在公开页面。
- [ ] 匿名需求表单校验正常。
- [ ] 需求提交后出现在管理员列表。
- [ ] 管理员可以修改状态和添加备注。
- [ ] 内容草稿保存和发布校验正常。
- [ ] 375px 和桌面宽度无横向溢出。

## 代码质量

- [ ] `pnpm test` 通过。
- [ ] `pnpm typecheck` 通过。
- [ ] `pnpm build` 通过。
- [ ] `pnpm test:integration` 通过。
- [ ] 备份文件已生成并复制到安全位置。
