import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import userRouter from './routes/userRoutes.js'
import projectRouter from './routes/projectRoutes.js'
import { stripeWebhook } from './controllers/stripeWebhook.js'

const app = express()
const port = process.env.PORT || 3000

/* ---------- FIX __dirname FOR ESM ---------- */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ---------- CORS ---------- */
app.use(cors({
  origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
  credentials: true,
}))

app.use(express.json({ limit: '50mb' }))

/* ---------- STRIPE WEBHOOK ---------- */
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

/* ---------- AUTH ---------- */
app.use('/api/auth', toNodeHandler(auth))

/* ---------- API ROUTES ---------- */
app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

/* ---------- FRONTEND (PRODUCTION) ---------- */
// server/dist → ../client/dist
const clientDistPath = path.resolve(__dirname, '../../client/dist')

app.use(express.static(clientDistPath))

app.get(/.*/, (_req:Request, res:Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

/* ---------- START SERVER ---------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
