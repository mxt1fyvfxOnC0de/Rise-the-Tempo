import { useMemo, useState } from 'react';
import { ClanLeaderboard } from './components/ClanLeaderboard';
import { PlayerCard } from './components/PlayerCard';
import { RadarChart } from './components/RadarChart';
import { UpgradeDashboard } from './components/UpgradeDashboard';
import { calculateIntensityScore } from './lib/upgrader';

const defaultCard = {
  name: 'Tempo Athlete',
  stats: {
    pace: 72,
    shooting: 68,
    passing: 71,
    dribbling: 74,
    defense: 64,
    physical: 69
  },
  overall: 70,
  tier: 'Silver',
  weeklyGain: 4
};

const initialClans = [
  { id: 'a', name: 'Pulse United', members: [{ overall: 74, weeklyGain: 6 }, { overall: 70, weeklyGain: 4 }] },
  { id: 'b', name: 'Sprint Syndicate', members: [{ overall: 80, weeklyGain: 8 }, { overall: 71, weeklyGain: 3 }] },
  { id: 'c', name: 'Iron Tempo', members: [{ overall: 66, weeklyGain: 5 }, { overall: 69, weeklyGain: 4 }] }
];

export default function App() {
  const savedCard = localStorage.getItem('rise-tempo-card');
  const [card, setCard] = useState(savedCard ? JSON.parse(savedCard) : defaultCard);

  const clans = useMemo(
    () =>
      initialClans
        .map((clan) => ({
          ...clan,
          intensityScore: calculateIntensityScore(clan.members)
        }))
        .sort((a, b) => b.intensityScore - a.intensityScore),
    []
  );

  const activityFeed = [
    { id: 1, user: 'User_X', message: 'upgraded to Elite Tier by finishing a 3-mile run.' },
    { id: 2, user: 'Abraham', message: 'logged 40 push-ups and boosted Physical +5.' },
    { id: 3, user: 'Justin', message: 'set a 100m PR and raised clan intensity.' }
  ];

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 p-6 lg:grid-cols-[360px_1fr_420px]">
      <PlayerCard player={card} />

      <section className="flex flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl">
        <h3 className="mb-3 text-xl font-semibold">Attribute Spread</h3>
        <RadarChart stats={card.stats} />
      </section>

      <div className="space-y-6">
        <UpgradeDashboard onCardUpdate={setCard} />
        <ClanLeaderboard clans={clans} warEndsAt={new Date(Date.now() + 24 * 3600 * 1000)} feed={activityFeed} />
      </div>
    </main>
  );
}
