# syntax=docker/dockerfile:1.7

# ---- Builder ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install deps using npm against package.json (bun lockfile not required)
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
# Vite reads VITE_* env at build time; pass them via --build-arg or compose `args`
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN npm run build

# ---- Runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Only ship the built output (Nitro bundles all server deps)
COPY --from=builder /app/.output ./.output
COPY package.json ./

EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]
