import { ClanPowerHistory } from '../models/ClanPowerHistory.js';
import { UserStat } from '../models/UserStat.js';

export async function calculateClanPowerSnapshot() {
  const aggregate = await UserStat.aggregate([
    {
      $group: {
        _id: '$clanID',
        power: { $sum: '$xpTotal' },
        users: { $sum: 1 }
      }
    }
  ]);

  const snapshots = aggregate.map((row) => ({
    clanID: row._id,
    power: Math.round(row.power / Math.max(1, row.users))
  }));

  if (snapshots.length > 0) {
    await ClanPowerHistory.insertMany(snapshots.map((item) => ({ ...item, snapshotAt: new Date() })));
  }

  return snapshots;
}
