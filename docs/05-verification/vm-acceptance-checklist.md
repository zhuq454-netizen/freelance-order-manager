# 虚拟机验收清单

日期：

## 虚拟机

- [ ] Ubuntu 24.04 LTS 已安装并完成更新。
- [ ] Docker Engine 和 Compose Plugin 已安装。
- [ ] 部署用户可执行 Docker。
- [ ] 虚拟机 IP 已记录。
- [ ] SSH 和 80/tcp 防火墙规则已配置。

## Compose

- [ ] `.env.vm` 已创建且权限为 600。
- [ ] PostgreSQL、Redis、MinIO、Mailpit 启动成功。
- [ ] API、Web、Nginx 镜像构建成功。
- [ ] Nginx 对外暴露 80，内部服务未暴露到公网。
- [ ] API healthcheck 通过。

## 数据和业务

- [ ] migration 成功。
- [ ] seed 成功。
- [ ] 公共服务和项目可访问。
- [ ] 匿名需求提交成功。
- [ ] 管理员登录成功。
- [ ] 状态和备注操作成功。
- [ ] 内容草稿和发布校验成功。

## 重启和恢复

- [ ] 虚拟机重启后 Docker 自动启动。
- [ ] Compose 服务自动恢复。
- [ ] PostgreSQL 数据仍存在。
- [ ] API、Web、Nginx 重新可访问。
- [ ] PostgreSQL 和 MinIO 备份已完成。
- [ ] 恢复演练结果已记录。
