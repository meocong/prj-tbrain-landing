FROM node:22-alpine

WORKDIR /app

# git for dependencies; python3 for the Terminal Bench test-AST parser used by the ingest script.
RUN apk add --no-cache git python3 && \
    corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

# Next.js build reads NEXT_PUBLIC_* at build-time; everything else is runtime-only.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

RUN pnpm build

ENV NODE_ENV=production

CMD ["pnpm", "start"]
