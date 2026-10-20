# Networks Midterm Workbench
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Bundle the server and client into dist/. The bundle has no runtime
# dependencies (devDependencies are only for typechecking), so no install.
FROM base AS build
COPY package.json ./
COPY src ./src
RUN bun run build

# Production stage: only the bundle, no node_modules needed. Bun resolves the
# bundled asset paths relative to the working directory, so run from dist/.
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
WORKDIR /app/dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT ?? 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

USER bun
CMD ["bun", "server.js"]
