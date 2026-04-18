FROM node:20-alpine

WORKDIR /app

# git for dependencies; python3 for the Terminal Bench test-AST parser used by the ingest script.
RUN apk add --no-cache git python3

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install --legacy-peer-deps

COPY . .

# Next.js build reads NEXT_PUBLIC_* at build-time; everything else is runtime-only.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

RUN npm run build

ENV NODE_ENV=production

CMD ["npm","run","start"]


