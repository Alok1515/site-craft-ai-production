import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
  credentials: true,
};

const __dirname = path.resolve();

/* ---------- MIDDLEWARE ---------- */
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

/* ---------- STRIPE WEBHOOK ---------- */
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

/* ---------- AUTH ---------- */
app.use('/api/auth', toNodeHandler(auth));

/* ---------- API ROUTES ---------- */
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

/* ---------- FRONTEND (PRODUCTION) ---------- */
const rootDir = path.resolve(process.cwd(), '..');

app.use(express.static(path.join(rootDir, 'client', 'dist')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(rootDir, 'client', 'dist', 'index.html'));
});


/* ---------- START SERVER ---------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
