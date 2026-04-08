import { useMemo, useState } from 'react';
import { BrainCircuit, Dumbbell, Home, Info, UserRound } from 'lucide-react';
import { ClanLeaderboard } from './components/ClanLeaderboard';
import { PlayerCard } from './components/PlayerCard';
import { RadarChart } from './components/RadarChart';
import { UpgradeDashboard } from './components/UpgradeDashboard';
import { login, register, saveStats, scanExercise } from './lib/api';
import { calculateIntensityScore } from './lib/upgrader';

const defaultCard = {
  name: 'Tempo Athlete',
  profilePicture: 'https://i.pravatar.cc/120?img=12',
  stats: { pace: 72, shooting: 68, passing: 71, dribbling: 74, defense: 64, physical: 69 },
  overall: 70,
  tier: 'Silver',
  weeklyGain: 4,
  clanID: 'Pulse United',
  xpTotal: 500
};

const initialClans = [
  { id: 'a', name: 'Pulse United', members: [{ overall: 74, weeklyGain: 6 }, { overall: 70, weeklyGain: 4 }] },
  { id: 'b', name: 'Sprint Syndicate', members: [{ overall: 80, weeklyGain: 8 }, { overall: 71, weeklyGain: 3 }] },
  { id: 'c', name: 'Iron Tempo', members: [{ overall: 66, weeklyGain: 5 }, { overall: 69, weeklyGain: 4 }] }
];

export default function App() {
  const savedCard = localStorage.getItem('rise-tempo-card');
  const savedToken = localStorage.getItem('rise-tempo-token');
  const [card, setCard] = useState(savedCard ? JSON.parse(savedCard) : defaultCard);
  const [token, setToken] = useState(savedToken || '');
  const [authForm, setAuthForm] = useState({ username: '', password: '', profilePicture: '' });
  const [screen, setScreen] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [scanForm, setScanForm] = useState({ activityType: 'run', durationMinutes: 20, reps: 0, proofText: '', sensorConfidence: 0.55 });
  const [scanResult, setScanResult] = useState(null);

  const clans = useMemo(() => initialClans.map((clan) => ({ ...clan, intensityScore: calculateIntensityScore(clan.members) })).sort((a, b) => b.intensityScore - a.intensityScore), []);

  const activityFeed = [
    { id: 1, user: 'User_X', message: 'upgraded to ELITE Tier by finishing a 3-mile run.' },
    { id: 2, user: 'Abraham', message: 'logged 40 push-ups and boosted Physical +5.' },
    { id: 3, user: 'Justin', message: 'set a 100m PR and raised clan intensity.' }
  ];

  const handleCardUpdate = async (next) => {
    const payload = { ...card, ...next, xpTotal: card.xpTotal + next.weeklyGain * 50 };
    setCard(payload);
    localStorage.setItem('rise-tempo-card', JSON.stringify(payload));
    if (token) {
      try {
        await saveStats(token, {
          clanID: payload.clanID,
          cardTier: payload.tier,
          xpTotal: payload.xpTotal,
          attributes: payload.stats,
          weeklyGain: payload.weeklyGain
        });
      } catch (error) {
        setMessage(error.message);
      }
    }
  };

  const submitAuth = async (mode) => {
    try {
      const payload = mode === 'register' ? await register(authForm) : await login(authForm);
      setToken(payload.token);
      setCard((prev) => ({ ...prev, name: payload.user.username, profilePicture: payload.user.profile_picture || prev.profilePicture }));
      localStorage.setItem('rise-tempo-token', payload.token);
      setMessage(`${mode} successful`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitScan = async (event) => {
    event.preventDefault();
    if (!token) {
      setMessage('log in first to run AI scanner');
      return;
    }
    try {
      const payload = await scanExercise(token, scanForm);
      setScanResult(payload.result);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <header className="rounded-2xl border border-white/20 bg-slate-900/50 p-4">
        <h1 className="text-2xl font-bold">Rise The Tempo</h1>
        <nav className="mt-3 flex flex-wrap gap-2">
          {[
            ['dashboard', <Home size={15} />, 'Dashboard'],
            ['scanner', <BrainCircuit size={15} />, 'AI Scanner'],
            ['account', <UserRound size={15} />, 'Account'],
            ['info', <Info size={15} />, 'Info']
          ].map(([key, icon, label]) => (
            <button key={key} onClick={() => setScreen(key)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${screen === key ? 'bg-cyan-400 text-slate-900' : 'bg-white/10'}`}>
              {icon} {label}
            </button>
          ))}
        </nav>
      </header>

      {message && <p className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 p-3 text-sm">{message}</p>}

      {screen === 'dashboard' && (
        <section className="grid gap-6 lg:grid-cols-[360px_1fr_420px]">
          <PlayerCard player={card} />
          <section className="flex flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl">
            <h3 className="mb-3 text-xl font-semibold">Attribute Spread</h3>
            <RadarChart stats={card.stats} />
          </section>
          <div className="space-y-6">
            <UpgradeDashboard onCardUpdate={handleCardUpdate} />
            <ClanLeaderboard clans={clans} warEndsAt={new Date(Date.now() + 24 * 3600 * 1000)} feed={activityFeed} />
          </div>
        </section>
      )}

      {screen === 'scanner' && (
        <form onSubmit={submitScan} className="space-y-4 rounded-3xl border border-white/15 bg-white/5 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Dumbbell size={19} /> AI Exercise Verification</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-xl bg-slate-900/40 p-2" placeholder="Activity type" value={scanForm.activityType} onChange={(e) => setScanForm((p) => ({ ...p, activityType: e.target.value }))} />
            <input className="rounded-xl bg-slate-900/40 p-2" type="number" placeholder="Duration minutes" value={scanForm.durationMinutes} onChange={(e) => setScanForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} />
            <input className="rounded-xl bg-slate-900/40 p-2" type="number" placeholder="Reps" value={scanForm.reps} onChange={(e) => setScanForm((p) => ({ ...p, reps: Number(e.target.value) }))} />
            <input className="rounded-xl bg-slate-900/40 p-2" type="number" min="0" max="1" step="0.01" placeholder="Sensor confidence 0-1" value={scanForm.sensorConfidence} onChange={(e) => setScanForm((p) => ({ ...p, sensorConfidence: Number(e.target.value) }))} />
          </div>
          <textarea className="min-h-24 w-full rounded-xl bg-slate-900/40 p-2" placeholder="Proof notes: include route, sets, pace, heart rate..." value={scanForm.proofText} onChange={(e) => setScanForm((p) => ({ ...p, proofText: e.target.value }))} />
          <button className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Run AI verification</button>
          {scanResult && <div className="rounded-xl border border-white/20 bg-slate-900/35 p-3 text-sm">Verdict: <b>{scanResult.verdict}</b> · Confidence: <b>{scanResult.confidence}</b><p>{scanResult.insight}</p></div>}
        </form>
      )}

      {screen === 'account' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
            <h2 className="mb-3 text-xl font-semibold">Login / Register</h2>
            <div className="space-y-3">
              <input className="w-full rounded-xl bg-slate-900/40 p-2" placeholder="username" value={authForm.username} onChange={(e) => setAuthForm((p) => ({ ...p, username: e.target.value }))} />
              <input className="w-full rounded-xl bg-slate-900/40 p-2" type="password" placeholder="password" value={authForm.password} onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))} />
              <input className="w-full rounded-xl bg-slate-900/40 p-2" placeholder="profile picture URL" value={authForm.profilePicture} onChange={(e) => setAuthForm((p) => ({ ...p, profilePicture: e.target.value }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-xl bg-cyan-400 px-3 py-2 text-slate-900" onClick={() => submitAuth('login')} type="button">Login</button>
              <button className="rounded-xl bg-emerald-400 px-3 py-2 text-slate-900" onClick={() => submitAuth('register')} type="button">Register</button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
            <h2 className="mb-2 text-xl font-semibold">Your account card</h2>
            <p className="text-sm text-slate-300">Connected: {token ? 'Yes' : 'No'}</p>
            <p className="text-sm text-slate-300">Tier ladder: Bronze → Silver → Gold → ELITE</p>
            <p className="mt-4 text-sm">Tip: Use a profile photo URL and keep upgrading your stats to reach ELITE card gradients inspired by FUT-style colorways.</p>
          </div>
        </section>
      )}

      {screen === 'info' && (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Info & Product Pages</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-200">
            <li>Dashboard page separates card, radar, upgrades, and clan feed to reduce crowding.</li>
            <li>AI scanner page validates exercise evidence with confidence + verdict output.</li>
            <li>Account page handles auth, profile picture, and persistent login token.</li>
            <li>SQLite backend stores users, stats, and verification logs.</li>
          </ul>
        </section>
      )}
    </main>
  );
}
