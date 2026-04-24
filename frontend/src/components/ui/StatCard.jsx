const gradientMap = {
  'text-blue-600':   'from-blue-500 to-blue-600',
  'text-green-600':  'from-emerald-500 to-green-600',
  'text-amber-600':  'from-amber-500 to-orange-500',
  'text-purple-600': 'from-violet-500 to-purple-600',
  'text-red-600':    'from-red-500 to-rose-600',
  'text-cyan-600':   'from-cyan-500 to-sky-600',
};

const glowMap = {
  'text-blue-600':   'shadow-blue-500/20',
  'text-green-600':  'shadow-emerald-500/20',
  'text-amber-600':  'shadow-amber-500/20',
  'text-purple-600': 'shadow-violet-500/20',
  'text-red-600':    'shadow-red-500/20',
  'text-cyan-600':   'shadow-cyan-500/20',
};

export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const gradient = gradientMap[color] ?? 'from-slate-400 to-slate-500';
  const glow     = glowMap[color]     ?? 'shadow-slate-500/20';

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-black/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-[2rem] font-black leading-none tracking-tight text-slate-900">
            {value ?? <span className="text-slate-200">—</span>}
          </p>
          {sub && (
            <p className="mt-2 text-xs font-medium text-slate-400">{sub}</p>
          )}
        </div>
        <div className={`shrink-0 rounded-2xl bg-gradient-to-br p-3.5 shadow-lg ${gradient} ${glow}`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
