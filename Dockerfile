# syntax=docker/dockerfile:1.7
FROM node:22-alpine

WORKDIR /app

# git for dependencies; python3 for the Terminal Bench test-AST parser used by the ingest script.
# chromium is required by the admin PDF export flow.
RUN apk add --no-cache git python3 chromium nss freetype harfbuzz ca-certificates ttf-freefont && \
    corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile --config.strict-dep-builds=false

COPY . .

# Next.js build reads NEXT_PUBLIC_* at build-time; everything else is runtime-only.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ARG NEXT_PUBLIC_TBRAIN_SSO_ENABLED="true"
ARG NEXT_PUBLIC_TBRAIN_SSO_PROVIDER="keycloak"
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=""
ARG BUILD_CACHE_BUST=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_TBRAIN_SSO_ENABLED=${NEXT_PUBLIC_TBRAIN_SSO_ENABLED}
ENV NEXT_PUBLIC_TBRAIN_SSO_PROVIDER=${NEXT_PUBLIC_TBRAIN_SSO_PROVIDER}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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

ENV NODE_ENV=production

CMD ["pnpm", "start"]
