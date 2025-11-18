FROM public.ecr.aws/docker/library/node:20-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

# ===== Dependencies Stage =====
FROM base AS dependencies
RUN yarn install --frozen-lockfile --production

# ===== Build Stage =====
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN chmod +x copy-assets.sh
RUN yarn prisma generate
RUN yarn build

# ===== Production Stage =====
FROM base AS production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Copy entrypoint script and other files
COPY docker-entrypoint.sh ./
COPY package.json yarn.lock ./

RUN chmod +x docker-entrypoint.sh && \
    groupadd -r nodejs && \
    useradd -r -g nodejs -m nodejs && \
    chown -R nodejs:nodejs /app

ENV HOME=/home/nodejs
USER nodejs

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]