import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import statsRoutes from './routes/statsRoutes.js';
import { connectDb } from './services/db.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'rise-the-tempo-backend', now: new Date().toISOString(), db: 'sqlite' });
});

app.use('/api', statsRoutes);

connectDb();
app.listen(port, () => {
  console.log(`Rise The Tempo API listening on port ${port}`);
});
