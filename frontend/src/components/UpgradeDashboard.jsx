import { useMemo, useState } from 'react';
import { Activity, Gauge, Trophy } from 'lucide-react';
import { calculateOverall, deriveStatsFromInputs, getTier } from '../lib/upgrader';

export function UpgradeDashboard({ onCardUpdate }) {
  const [inputs, setInputs] = useState({
    fiveKmSeconds: 1650,
    hundredMeterSeconds: 14,
    pushUpsPerSet: 24
  });

  const projected = useMemo(() => {
    const stats = deriveStatsFromInputs(inputs);
    const overall = calculateOverall(stats);
    return {
      stats,
      overall,
      tier: getTier(overall)
    };
  }, [inputs]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: 'Tempo Athlete',
      ...projected,
      weeklyGain: Math.max(1, Math.round(projected.overall / 12))
    };

    onCardUpdate(payload);
    localStorage.setItem('rise-tempo-card', JSON.stringify(payload));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fitness-to-Card Upgrader</h3>
        <Activity className="text-cyan-300" />
      </div>

      <div className="space-y-4">
        {[
          { key: 'fiveKmSeconds', label: '5km time (seconds)' },
          { key: 'hundredMeterSeconds', label: '100m sprint (seconds)' },
          { key: 'pushUpsPerSet', label: 'Push-ups in one set' }
        ].map((field) => (
          <label key={field.key} className="block text-sm text-slate-200">
            <span className="mb-1 block">{field.label}</span>
            <input
              type="number"
              min="1"
              className="w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 text-white"
              value={inputs[field.key]}
              onChange={(event) => setInputs((prev) => ({ ...prev, [field.key]: Number(event.target.value) }))}
            />
          </label>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
        <StatChip icon={<Gauge size={14} />} label="OVR" value={projected.overall} />
        <StatChip icon={<Trophy size={14} />} label="Tier" value={projected.tier} />
        <StatChip icon={<Activity size={14} />} label="Pace" value={projected.stats.pace} />
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-xl bg-cyan-400/90 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
      >
        Upgrade Card
      </button>
    </form>
  );
}

function StatChip({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2">
      <p className="mb-1 flex items-center gap-1 text-slate-300">{icon} {label}</p>
      <p className="font-semibold text-cyan-100">{value}</p>
    </div>
  );
}
