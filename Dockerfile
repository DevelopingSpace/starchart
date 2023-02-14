FROM node:19-bullseye-slim@sha256:34211d15e360eff92c17587ff3c3d3bea3061ca3961f745fd59ab30bda954ff9 as base

ARG CURL_VERSION=7.74.* \
  OPENSSL_VERSION=1.1.* \
  TINI_VERSION=0.19.*
  
# hadolint ignore=SC2086
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl=${CURL_VERSION} \
  openssl=${OPENSSL_VERSION} \
  tini=${TINI_VERSION} \
  && rm -rf /var/lib/apt/lists/*

###############################################################################

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --include=dev --ignore-scripts

###############################################################################

# Remove any non-production dependencies
FROM base as production-deps

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json .npmrc ./
RUN npm prune --omit=dev

###############################################################################

# Build the app and generate the prisma client
FROM base as build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate \
  && npm run build

###############################################################################

# Deploy the built app on top of the production deps, run as non-root
FROM base as deploy

WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    LOG_LEVEL=info

USER node
COPY --chown=node:node --from=production-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/public ./public

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "./build/server.js"]

HEALTHCHECK CMD curl --fail http://localhost:${PORT}/healthcheck || exit 1
EXPOSE ${PORT}
