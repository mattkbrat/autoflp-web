FROM node:23.3-alpine3.19 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm i -g pnpm 

ENV DATABASE_URL="file:/autoflp.sqlite" 

COPY . /app
WORKDIR /app

FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm generate
RUN pnpm build

FROM base AS runner

WORKDIR /app

RUN adduser -D nodeuser && \
  mkdir -p /app && \
  chown nodeuser:nodeuser /app

COPY --from=build --chown=nodeuser:nodeuser /app/build build/
COPY --from=build --chown=nodeuser:nodeuser /app/node_modules node_modules/
COPY package.json .

ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "build" ]
