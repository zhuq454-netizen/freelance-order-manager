import type { INestApplication } from '@nestjs/common';

type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

/**
 * 配置 API 与开发中的 Web/Tauri 页面之间的最小跨域边界。
 *
 * 浏览器开发服务器和 API 使用不同端口，因此浏览器会执行 CORS 检查。
 * 生产环境由 Nginx 统一提供同源地址，但保留可配置来源可以让 VM 调试
 * 和未来的独立桌面 WebView 使用同一套 API 配置，而不把来源写死在控制器里。
 */
export function configureHttp(app: INestApplication) {
  const configuredOrigins = process.env.CORS_ORIGINS;
  const origins = (
    configuredOrigins ?? 'http://127.0.0.1:5173,http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set(origins);
  const allowLocalLoopbackPorts = configuredOrigins == null;
  const localLoopbackOrigin =
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

  app.enableCors({
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
      // 没有 Origin 的请求通常来自 curl、健康检查或服务间调用，应直接放行。
      callback(
        null,
        !origin ||
          allowedOrigins.has(origin) ||
          (allowLocalLoopbackPorts && localLoopbackOrigin.test(origin)),
      );
    },
  });
}
