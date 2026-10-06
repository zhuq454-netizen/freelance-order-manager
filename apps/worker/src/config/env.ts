import { z } from 'zod';

export const workerEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  DATABASE_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().trim().min(1).optional(),
  S3_BUCKET: z.string().trim().min(1).optional(),
  S3_ACCESS_KEY: z.string().trim().min(1).optional(),
  S3_SECRET_KEY: z.string().trim().min(1).optional(),
});

export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export function validateWorkerEnvironment(
  input: Record<string, unknown>,
): WorkerEnvironment {
  return workerEnvironmentSchema.parse(input);
}
