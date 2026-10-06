#!/usr/bin/env sh
set -eu

base_url="${1:-http://localhost}"
curl --fail --silent --show-error "$base_url/" >/dev/null
curl --fail --silent --show-error "$base_url/api/health/live"
curl --fail --silent --show-error "$base_url/api/health/ready"
