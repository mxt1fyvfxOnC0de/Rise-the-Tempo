import crypto from 'crypto';
import express from 'express';
import { getDb } from '../services/db.js';

const router = express.Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function tokenFor(user) {
  const payload = `${user.id}:${user.username}:${process.env.AUTH_SALT || 'rise-tempo'}`;
  return Buffer.from(payload).toString('base64url');
}

function readAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const raw = Buffer.from(auth.replace('Bearer ', ''), 'base64url').toString('utf-8');
    const [id, username] = raw.split(':');
    if (!id || !username) return null;
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ? AND username = ?').get(Number(id), username);
  } catch {
    return null;
  }
}

router.post('/auth/register', (req, res) => {
  const { username, password, profilePicture } = req.body;
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'username and password are required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ ok: false, error: 'username already exists' });
  }

  const insert = db
    .prepare('INSERT INTO users (username, password_hash, profile_picture) VALUES (?, ?, ?)')
    .run(username, hashPassword(password), profilePicture || null);

  db.prepare('INSERT INTO user_stats (user_id) VALUES (?)').run(insert.lastInsertRowid);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(insert.lastInsertRowid);
  return res.json({ ok: true, token: tokenFor(user), user });
});

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ ok: false, error: 'invalid credentials' });
  }

  return res.json({ ok: true, token: tokenFor(user), user });
});

router.get('/auth/me', (req, res) => {
  const user = readAuthUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  const db = getDb();
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(user.id);
  return res.json({ ok: true, user, stats });
});

router.post('/user/stats', (req, res) => {
  const user = readAuthUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const payload = req.body;
  const db = getDb();

  db.prepare(
    `UPDATE users SET clan_id = ?, card_tier = ?, xp_total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(payload.clanID, payload.cardTier, payload.xpTotal, user.id);

  db.prepare(
    `UPDATE user_stats SET pace = ?, shooting = ?, passing = ?, dribbling = ?, defense = ?, physical = ?, weekly_gain = ?, last_activity_timestamp = CURRENT_TIMESTAMP WHERE user_id = ?`
  ).run(
    payload.attributes?.pace ?? 60,
    payload.attributes?.shooting ?? 60,
    payload.attributes?.passing ?? 60,
    payload.attributes?.dribbling ?? 60,
    payload.attributes?.defense ?? 60,
    payload.attributes?.physical ?? 60,
    payload.weeklyGain ?? 0,
    user.id
  );

  return res.json({ ok: true });
});

router.post('/ai/scan-exercise', (req, res) => {
  const user = readAuthUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const { activityType, durationMinutes = 0, reps = 0, proofText = '', sensorConfidence = 0.5 } = req.body;
  const textScore = Math.min(proofText.trim().split(/\s+/).filter(Boolean).length / 18, 1);
  const effortScore = Math.min(durationMinutes / 45 + reps / 200, 1);
  const confidence = Number((0.45 * effortScore + 0.35 * textScore + 0.2 * sensorConfidence).toFixed(2));
  const verdict = confidence >= 0.65 ? 'verified' : confidence >= 0.45 ? 'review' : 'rejected';

  const db = getDb();
  db.prepare(
    `INSERT INTO exercise_logs (user_id, activity_type, duration_minutes, reps, proof_text, ai_confidence, ai_verdict)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(user.id, activityType || 'unknown', durationMinutes, reps, proofText, confidence, verdict);

  return res.json({
    ok: true,
    result: {
      confidence,
      verdict,
      insight:
        verdict === 'verified'
          ? 'Your movement + proof quality look consistent with a real workout.'
          : 'Add stronger workout details and sensor evidence to boost verification confidence.'
    }
  });
});

router.get('/clans/leaderboard', (_req, res) => {
  const db = getDb();
  const leaderboard = db
    .prepare(
      `SELECT clan_id AS clanID,
              ROUND(CASE WHEN COUNT(*) = 0 THEN 0 ELSE (SUM(xp_total) * 1.0 / COUNT(*)) END, 0) AS intensityScore,
              COUNT(*) AS members
       FROM users
       GROUP BY clan_id
       ORDER BY intensityScore DESC`
    )
    .all();

  return res.json({ ok: true, leaderboard, updatedAt: new Date().toISOString() });
});

router.get('/clans/feed', (_req, res) => {
  const db = getDb();
  const recent = db
    .prepare(
      `SELECT username, card_tier, xp_total, updated_at
       FROM users
       ORDER BY updated_at DESC
       LIMIT 15`
    )
    .all();

  const feed = recent.map((row, idx) => ({
    id: idx + 1,
    user: row.username,
    message: `upgraded to ${row.card_tier} tier with ${row.xp_total} XP.`,
    at: row.updated_at
  }));

  return res.json({ ok: true, feed });
});

export default router;
