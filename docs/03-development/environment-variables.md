# 环境变量说明

## API 基础变量

| 变量           |     必填 | 示例                    | 说明                                  |
| -------------- | -------: | ----------------------- | ------------------------------------- |
| `NODE_ENV`     |       是 | `development`           | `development`、`test` 或 `production` |
| `PORT`         |       否 | `3000`                  | API 监听端口                          |
| `API_PREFIX`   |       否 | `api`                   | API 路径前缀                          |
| `OPENAPI_UI`   |       否 | `true`                  | 是否开放 Swagger 页面                 |
| `CORS_ORIGINS` | 开发建议 | `http://127.0.0.1:5173` | 允许的前端来源                        |
| `ADMIN_TOKEN`  | 生产必填 | 随机长字符串            | 单管理员 Bearer Token                 |

## 数据和基础设施变量

| 变量                     | 说明                             |
| ------------------------ | -------------------------------- |
| `DATABASE_URL`           | PostgreSQL 连接串                |
| `REDIS_URL`              | Redis 连接串                     |
| `S3_ENDPOINT`            | MinIO/S3 地址                    |
| `S3_REGION`              | 存储区域；本地通常为 `local`     |
| `S3_BUCKET`              | 私有对象存储桶                   |
| `S3_ACCESS_KEY`          | MinIO/S3 访问密钥                |
| `S3_SECRET_KEY`          | MinIO/S3 私钥                    |
| `SMTP_HOST`、`SMTP_PORT` | 邮件服务配置；本地可指向 Mailpit |
| `VITE_API_BASE_URL`      | Web 调用 API 的基地址            |

## 密钥规则

- 本地示例可以使用 `infra/docker/.env.local.example` 的默认值。
- 虚拟机和生产环境必须修改 PostgreSQL、MinIO 和 `ADMIN_TOKEN`。
- 不把 `.env`、`.env.local`、`.env.vm`、数据库备份和 MinIO 密钥提交到 Git。
- 生产环境关闭不需要的 Swagger 页面，或通过内网/访问控制保护。
