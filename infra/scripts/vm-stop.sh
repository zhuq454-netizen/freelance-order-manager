#!/usr/bin/env sh
set -eu

docker compose --env-file infra/docker/.env.vm -f infra/docker/compose.vm.yml down
