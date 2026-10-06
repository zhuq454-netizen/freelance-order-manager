FROM node:22-bookworm-slim
RUN corepack enable
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @orderlydesk/api build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@orderlydesk/api", "start:prod"]
