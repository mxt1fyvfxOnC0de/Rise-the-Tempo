import { Flame, Swords } from 'lucide-react';

export function ClanLeaderboard({ clans, warEndsAt, feed }) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Clan Wars Hub</h3>
        <div className="flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-3 py-1 text-xs uppercase text-rose-100">
          <Swords size={14} /> War active · ends {new Date(warEndsAt).toLocaleTimeString()}
        </div>
      </header>

      <div className="space-y-3">
        {clans.map((clan, index) => (
          <article key={clan.id} className="rounded-2xl border border-white/20 bg-slate-900/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">#{index + 1}</p>
                <h4 className="font-semibold text-cyan-100">{clan.name}</h4>
              </div>
              <p className="text-xl font-bold text-emerald-300">{clan.intensityScore}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-white/20 bg-slate-950/35 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-medium"><Flame size={16} /> Activity Feed</h4>
        <ul className="space-y-2 text-sm text-slate-200">
          {feed.map((item) => (
            <li key={item.id} className="rounded-lg bg-white/5 p-2">
              <span className="text-cyan-200">{item.user}</span> {item.message}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
