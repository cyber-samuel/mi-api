const { PrismaClient } = require('@prisma/client');

// Add ?connect_timeout and pool params to the DATABASE_URL
const baseUrl = process.env.DATABASE_URL || '';
const dbUrl = baseUrl.includes('?')
  ? baseUrl + '&connect_timeout=30&pool_timeout=30&connection_limit=5'
  : baseUrl + '?connect_timeout=30&pool_timeout=30&connection_limit=5';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: { db: { url: dbUrl } },
});

// Retry codes emitted by Prisma when Render free-tier DB drops idle connections
const RETRY_CODES = new Set(['P1017', 'P1001', 'P1002', 'P1008', 'P1011']);

function isRetryable(err) {
  const code = err?.code || err?.errorCode || '';
  const msg  = (err?.message || '').toLowerCase();
  return (
    RETRY_CODES.has(code) ||
    msg.includes('server has closed the connection') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('connection pool') ||
    msg.includes('connection refused')
  );
}

// Global query middleware that retries up to 3 times on connection errors
prisma.$use(async (params, next) => {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await next(params);
    } catch (err) {
      lastErr = err;
      if (isRetryable(err) && attempt < 3) {
        console.warn(`[Prisma] Connection error (attempt ${attempt}/3), retrying in 3 s… [${err.code || err.message?.slice(0, 60)}]`);
        await new Promise((r) => setTimeout(r, 3000));
        // Force reconnect
        try { await prisma.$disconnect(); } catch (_) {}
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
});

module.exports = prisma;
