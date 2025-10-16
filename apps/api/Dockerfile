FROM oven/bun:1 as base

WORKDIR /app
COPY package.json bun.lock* ./

RUN bun install

COPY prisma ./prisma
RUN bun run prisma generate

COPY . .

FROM oven/bun:1-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=base /app/package.json ./
COPY --from=base /app/bun.lock ./
RUN bun install

COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/index.ts ./
COPY --from=base /app/auth ./auth
COPY --from=base /app/concepts ./concepts
COPY --from=base /app/courses ./courses
COPY --from=base /app/students ./students
COPY --from=base /app/instructors ./instructors
COPY --from=base /app/enrollments ./enrollments
COPY --from=base /app/contact ./contact
COPY --from=base /app/kanban ./kanban
COPY --from=base /app/middleware ./middleware
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.ts ./
COPY --from=base /app/tsconfig.json ./

EXPOSE 3000

CMD ["bun", "run", "start"] 
