import { z } from 'zod';

export const apiEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().trim().min(1).default('api'),
  OPENAPI_UI: z.enum(['true', 'false']).default('true'),
  ADMIN_TOKEN: z.string().trim().min(1).optional(),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().trim().min(1).optional(),
  S3_BUCKET: z.string().trim().min(1).optional(),
  S3_ACCESS_KEY: z.string().trim().min(1).optional(),
  S3_SECRET_KEY: z.string().trim().min(1).optional(),
});

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): ApiEnvironment {
  const environment = apiEnvironmentSchema.parse(input);
  if (environment.NODE_ENV === 'production' && !environment.ADMIN_TOKEN) {
    throw new Error('ADMIN_TOKEN is required in production environments.');
  }
  return environment;
}
