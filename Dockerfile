# Base image (use a specific version for reproducibility, e.g., replace latest tag if needed)
FROM oven/bun:1 AS base

WORKDIR /app

# Install all dependencies (devDeps needed for build)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build the app
COPY . .
RUN bun run build

# Production stage - use slim variant for smaller image
FROM oven/bun:1-slim AS release

WORKDIR /app

# Copy only production-ready files
COPY --from=base /app/package.json .
COPY --from=base /app/build ./build

# Optional: Install only prod deps in final image (smaller, but rare external runtime deps in SvelteKit)
# RUN bun install --frozen-lockfile --production

# Create db file and give bun user ownership
RUN touch /app/db.sqlite && chown -R bun:bun /app

# Run as non-root user for security (bun user exists in official image)
USER bun

EXPOSE 3000


CMD ["bun", "build/index.js"]
