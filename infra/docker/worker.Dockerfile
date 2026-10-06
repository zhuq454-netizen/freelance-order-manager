FROM node:22-bookworm-slim
RUN corepack enable
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @orderlydesk/worker build
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@orderlydesk/worker", "start:prod"]
