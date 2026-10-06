#!/usr/bin/env sh
set -eu

docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml config
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml build
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml up -d --wait
docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml ps
