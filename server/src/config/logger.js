// ─── Pino-style Structured Logger ──────────────────────────────────────────
// Lightweight structured logger. In production emits JSON lines for log
// aggregation; in dev prints coloured human-readable output.

import env from './env.js';

const isProduction = env.isProduction;

const LOG_LEVELS = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
const CURRENT_LEVEL = isProduction ? LOG_LEVELS.info : LOG_LEVELS.debug;

function formatMessage(level, message, meta = {}) {
  if (isProduction) {
    // Structured JSON line — easy for log aggregation tools
    return JSON.stringify({
      level,
      ts: new Date().toISOString(),
      msg: message,
      ...meta,
    });
  }

  // Dev: human-readable coloured output
  const colours = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m',  // green
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m', // red
    fatal: '\x1b[35m', // magenta
  };
  const reset = '\x1b[0m';
  const colour = colours[level] || reset;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${colour}[${level.toUpperCase()}]${reset} ${message}${metaStr}`;
}

function shouldLog(level) {
  return (LOG_LEVELS[level] ?? 20) >= CURRENT_LEVEL;
}

const logger = {
  debug(msg, meta) {
    if (shouldLog('debug')) console.debug(formatMessage('debug', msg, meta));
  },
  info(msg, meta) {
    if (shouldLog('info')) console.log(formatMessage('info', msg, meta));
  },
  warn(msg, meta) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', msg, meta));
  },
  error(msg, meta) {
    if (shouldLog('error')) console.error(formatMessage('error', msg, meta));
  },
  fatal(msg, meta) {
    if (shouldLog('fatal')) console.error(formatMessage('fatal', msg, meta));
  },
};

export default logger;
