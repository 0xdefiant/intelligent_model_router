FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN bun install --frozen-lockfile

# Copy source
COPY shared/ shared/
COPY server/ server/
COPY client/ client/
COPY tsconfig.base.json ./

# Build React frontend
RUN cd client && bun run build

# Production
FROM oven/bun:1.3-slim
WORKDIR /app

COPY --from=base /app/node_modules node_modules/
COPY --from=base /app/shared shared/
COPY --from=base /app/server server/
COPY --from=base /app/client/dist client/dist/
COPY --from=base /app/tsconfig.base.json ./

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["bun", "server/src/index.ts"]
