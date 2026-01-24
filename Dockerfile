FROM node:20-alpine

WORKDIR /app

RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    rm -rf /var/cache/apk/*

COPY package*.json ./
COPY prisma ./prisma/
COPY . .

RUN npm ci && \
    DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder" npx prisma generate && \
    NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build && \
    npm cache clean --force && \
    mkdir -p /app/standalone && \
    cp -r /app/.next/standalone/* /app/standalone/ && \
    cp -r /app/.next/static /app/standalone/.next/ && \
    cp -r /app/public /app/standalone/ 2>/dev/null || true && \
    cp -r /app/prisma /app/standalone/ && \
    cp /app/prisma.config.ts /app/standalone/ && \
    chown -R nextjs:nodejs /app

COPY --chown=nextjs:nodejs docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown nextjs:nodejs /docker-entrypoint.sh

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

USER nextjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
