import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cron from 'node-cron';
import statsRoutes from './routes/statsRoutes.js';
import { connectDb } from './services/db.js';
import { calculateClanPowerSnapshot } from './services/clanPowerService.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'rise-the-tempo-backend', now: new Date().toISOString() });
});

app.use('/api', statsRoutes);

cron.schedule('0 * * * *', async () => {
  try {
    const snapshots = await calculateClanPowerSnapshot();
    console.log(`Hourly clan power snapshots saved: ${snapshots.length}`);
  } catch (error) {
    console.error('Failed to store clan power snapshot', error.message);
  }
});

connectDb().finally(() => {
  app.listen(port, () => {
    console.log(`Rise The Tempo API listening on port ${port}`);
  });
});
