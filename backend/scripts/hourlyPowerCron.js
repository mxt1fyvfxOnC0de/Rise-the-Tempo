import 'dotenv/config';
import { connectDb } from '../src/services/db.js';
import { calculateClanPowerSnapshot } from '../src/services/clanPowerService.js';

(async () => {
  await connectDb();
  const snapshots = await calculateClanPowerSnapshot();
  console.log('Manual clan power run complete', snapshots);
  process.exit(0);
})();
