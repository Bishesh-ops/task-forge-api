FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock ./

COPY api/package.json ./api/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

COPY api/prisma ./api/prisma/

RUN bun install --frozen-lockfile

RUN cd api && bunx prisma generate

COPY api/ ./api/
COPY shared/ ./shared/
WORKDIR /app/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
