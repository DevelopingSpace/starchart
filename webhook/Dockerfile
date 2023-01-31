# Exposes webhook on port 8000
# Mount host docker socket to /var/run/docker.sock
# Mount host webhook directory to /hooks, the hooks.yaml and scripts should be in this directory

# Use Alpine
FROM alpine:latest as builder
ARG WEBHOOK_TAG=2.8.0

# Install packages
RUN apk update
RUN apk add --no-cache \
    docker-cli \
    go \
    git

# Install webhook (go get is not supported)
RUN git clone https://github.com/adnanh/webhook.git /go/src/github.com/adnanh/webhook \
    && cd /go/src/github.com/adnanh/webhook \
    && git checkout tags/${WEBHOOK_TAG} \
    && go get -d -v \
    && go build -o /usr/local/bin/webhook


# Create directories
RUN mkdir /hooks  # The hooks.yaml and scripts should be in this directory

# Cleanup
RUN apk del go git \
    && rm -rf /go /var/cache/apk/* /tmp/* /var/tmp/*


# Stage 2
FROM builder as final
WORKDIR /hooks
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/webhook"]
CMD ["-hooks", "hooks.yaml", "-verbose", "-hotreload", "-port", "8000"]
