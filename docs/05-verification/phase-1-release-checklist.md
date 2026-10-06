# Phase 1 发布验收

## 范围

- [ ] 公开个人资料、服务和作品展示完成。
- [ ] 匿名咨询提交完成。
- [ ] 单管理员内容管理完成。
- [ ] 需求列表、详情、状态和内部备注完成。
- [ ] 公开接口不会返回客户联系方式、内部备注或审计字段。

## 安全

- [ ] 生产密码和 ADMIN_TOKEN 已替换。
- [ ] `.env`、备份和密钥没有进入 Git。
- [ ] PostgreSQL、Redis、MinIO 没有直接公网暴露。
- [ ] 管理接口没有绕过 Bearer Token。
- [ ] 备份可读取，恢复步骤经过演练。

## 发布前命令

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

## 明确不包含

- 客户账号。
- 多服务商入驻。
- 在线支付和平台佣金。
- 评价、仲裁和实时聊天。
- 自动匹配、自动报价。
- 完整订单、项目和财务系统。

## 发布记录

- 版本：
- 部署环境：Windows / Ubuntu VM
- 数据库备份文件：
- 验收人：
- 遗留问题：
