import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';

const tierGradient = {
  Bronze: 'from-amber-700/60 to-orange-500/15',
  Silver: 'from-slate-100/45 to-slate-500/15',
  Gold: 'from-yellow-300/70 to-orange-400/20',
  ELITE: 'from-emerald-300/65 via-cyan-300/40 to-fuchsia-500/25'
};

export function PlayerCard({ player }) {
  return (
    <motion.div
      whileHover={{ rotateY: 8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className={`relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br ${tierGradient[player.tier]} p-6 shadow-glass backdrop-blur-3xl`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="relative z-10 space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={player.profilePicture || 'https://i.pravatar.cc/120?img=5'}
              alt={`${player.name} avatar`}
              className="h-14 w-14 rounded-full border-2 border-white/70 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200/90">Rise The Tempo</p>
              <h2 className="text-2xl font-semibold">{player.name}</h2>
            </div>
          </div>
          <span className="rounded-full border border-white/40 bg-slate-900/30 px-3 py-1 text-xs uppercase">{player.tier}</span>
        </header>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(player.stats).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-white/20 bg-slate-950/30 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-slate-300">{key}</p>
              <p className="text-xl font-bold text-cyan-100">{value}</p>
            </div>
          ))}
        </div>

        <footer className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/30 px-4 py-3 text-sm">
          <div className="flex items-center gap-2"><Shield size={16} /> OVR {player.overall}</div>
          <div className="flex items-center gap-2 text-emerald-300"><Zap size={16} /> +{player.weeklyGain} gain</div>
        </footer>
      </div>
    </motion.div>
  );
}
