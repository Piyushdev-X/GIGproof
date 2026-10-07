import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import incomeRouter from './routes/income.js';

const app = express();
const allowedOrigins = new Set((process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    if (process.env.VERCEL_URL && (origin === `https://${process.env.VERCEL_URL}` || origin === `http://${process.env.VERCEL_URL}`)) {
      return callback(null, true);
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL && (origin === `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || origin === `http://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)) {
      return callback(null, true);
    }
    if (process.env.VERCEL && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.json({ limit: '8kb', strict: true }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' } },
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/income', incomeRouter);
app.use('/api', (_req, res) => res.status(404).json({
  error: { code: 'NOT_FOUND', message: 'API route not found.' },
}));
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
  }
  console.error('Unhandled API error:', error?.name || 'unknown error');
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`Gigproof API listening on ${port}`));
