FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile && bun run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
