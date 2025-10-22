FROM oven/bun:1 AS base

WORKDIR /api

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN bun run prisma generate

# Copy source code
COPY . .

# Build stage
FROM oven/bun:1-slim

WORKDIR /

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and node_modules from base stage
COPY --from=base /api/package.json ./
COPY --from=base /api/bun.lock ./
COPY --from=base /api/node_modules ./node_modules

# Copy application files
COPY --from=base /api/index.ts ./
COPY --from=base /api/health.ts ./
COPY --from=base /api/auth ./auth
COPY --from=base /api/concepts ./concepts
COPY --from=base /api/courses ./courses
COPY --from=base /api/students ./students
COPY --from=base /api/instructors ./instructors
COPY --from=base /api/enrollments ./enrollments
COPY --from=base /api/contact ./contact
COPY --from=base /api/middleware ./middleware
COPY --from=base /api/prisma ./prisma
COPY --from=base /api/prisma.ts ./
COPY --from=base /api/tsconfig.json ./

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/api/v1/health || exit 1

# Start the application
CMD ["bun", "run", "start"]