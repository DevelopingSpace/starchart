# Exposes webhook on port 8000
# Mount host docker socket to /var/run/docker.sock
# Mount host webhook directory to /hooks, the hooks.yaml and scripts should be in this directory
FROM alpine:3.17@sha256:f271e74b17ced29b915d351685fd4644785c6d1559dd1f2d4189a5e851ef753a

ARG DOCKER_CLI_VERSION=20.10.21-r2
ARG WEBKOOK_VERSION=2.8.0-r12

WORKDIR /hooks

RUN apk add --no-cache \
    docker-cli=${DOCKER_CLI_VERSION} \
    webhook=${WEBKOOK_VERSION}
EXPOSE 8000
ENTRYPOINT ["/usr/bin/webhook"]
CMD ["-hooks", "hooks.yaml", "-port", "8000"]
