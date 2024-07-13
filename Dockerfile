FROM node:21.3-alpine3.17 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner

RUN adduser -D nodeuser && \
    mkdir -p /app && \
    chown nodeuser:nodeuser /app

COPY --from=prod-deps --chown=nodeuser:nodeuser /app/node_modules /app/node_modules
COPY --from=build --chown=nodeuser:nodeuser /app/build build/
COPY --from=build --chown=nodeuser:nodeuser /app/prisma ./prisma/schema
COPY package.json .

ENV ORIGIN=https://prov-dev.viaero.net
ENV HOST=0.0.0.0

EXPOSE 3000
CMD [ "node", "build" ]
