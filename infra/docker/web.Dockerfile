FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @orderlydesk/design-tokens build && pnpm --filter @orderlydesk/web build

FROM nginx:1.27-alpine
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 80
