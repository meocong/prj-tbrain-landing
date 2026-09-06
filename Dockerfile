# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

FROM base AS deps

# git for dependencies; python3 covers native dependency install hooks.
RUN apk add --no-cache git python3

COPY package.json pnpm-lock.yaml* ./

RUN --mount=type=cache,id=tbrain-landing-pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --config.strict-dep-builds=false

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Next.js build reads NEXT_PUBLIC_* at build-time; everything else is runtime-only.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ARG NEXT_PUBLIC_TBRAIN_SSO_ENABLED="true"
ARG NEXT_PUBLIC_TBRAIN_SSO_PROVIDER="keycloak"
ARG BUILD_CACHE_BUST=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_TBRAIN_SSO_ENABLED=${NEXT_PUBLIC_TBRAIN_SSO_ENABLED}
ENV NEXT_PUBLIC_TBRAIN_SSO_PROVIDER=${NEXT_PUBLIC_TBRAIN_SSO_PROVIDER}

# CMS-backed static pages read the Supabase service-role key during
# prerendering. Keep it as a BuildKit secret so it is not persisted as an
# image ENV value.
RUN --mount=type=secret,id=supabase_service_role_key \
    echo "build cache ${BUILD_CACHE_BUST}" >/dev/null && \
    test -n "${NEXT_PUBLIC_SUPABASE_URL}" && \
    test -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" && \
    test -n "${NEXT_PUBLIC_TBRAIN_SSO_ENABLED}" && \
    test -n "${NEXT_PUBLIC_TBRAIN_SSO_PROVIDER}" && \
    SUPABASE_SERVICE_ROLE_KEY="$(cat /run/secrets/supabase_service_role_key 2>/dev/null || true)" \
    pnpm build

RUN rm -f .next/standalone/.env .next/standalone/.env.local .next/standalone/.env.production

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Chromium is required by the admin PDF export flow.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
