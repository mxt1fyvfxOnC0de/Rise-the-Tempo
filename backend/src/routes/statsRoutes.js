import express from 'express';
import { UserStat } from '../models/UserStat.js';

const router = express.Router();

router.post('/user/stats', async (req, res) => {
  try {
    const payload = req.body;

    const doc = await UserStat.findOneAndUpdate(
      { userID: payload.userID },
      {
        $set: {
          clanID: payload.clanID,
          cardTier: payload.cardTier,
          xpTotal: payload.xpTotal,
          attributes: payload.attributes,
          lastActivityTimestamp: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, user: doc });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.get('/clans/leaderboard', async (_req, res) => {
  const leaderboard = await UserStat.aggregate([
    {
      $group: {
        _id: '$clanID',
        totalXP: { $sum: '$xpTotal' },
        members: { $sum: 1 }
      }
    },
    {
      $project: {
        clanID: '$_id',
        intensityScore: { $round: [{ $divide: ['$totalXP', { $max: ['$members', 1] }] }, 0] },
        _id: 0
      }
    },
    { $sort: { intensityScore: -1 } }
  ]);

  return res.json({ ok: true, leaderboard, updatedAt: new Date().toISOString() });
});

router.get('/clans/feed', async (_req, res) => {
  const recent = await UserStat.find({}).sort({ lastActivityTimestamp: -1 }).limit(15).lean();
  const feed = recent.map((row) => ({
    id: row.userID,
    user: row.userID,
    message: `upgraded to ${row.cardTier} tier with ${row.xpTotal} XP.`,
    at: row.lastActivityTimestamp
  }));

  return res.json({ ok: true, feed });
});

export default router;
