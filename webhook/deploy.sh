#!/usr/bin/env bash
set -eo pipefail

# https://github.com/DevelopingSpace/starchart/pkgs/container/starchart
IMAGE=ghcr.io/developingspace/starchart
SERVICE=starchart_mycustomdomain

# We expect to receive the new image tag via the TAG environment variable
if [[ -z "$TAG" ]]; then
    logger -s "webhook received, no tag set, skipping."
    exit 1
fi

logger -s "webhook received, starting update of ${SERVICE} to ${IMAGE}:${TAG}"

if docker service update --image "$IMAGE":"$TAG" "$SERVICE"; then
    logger -s "webhook update of ${SERVICE} to ${IMAGE}:${TAG} succeeded."
    exit 0
else
    logger -s "webhook update of ${SERVICE} to ${IMAGE}:${TAG} failed."
    exit 1
fi
