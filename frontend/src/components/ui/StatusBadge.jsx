const config = {
  Active:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  'At Risk': { bg: 'bg-red-50',      text: 'text-red-700',     ring: 'ring-red-600/20',     dot: 'bg-red-500'     },
  Completed: { bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-600/20',    dot: 'bg-blue-500'    },
  Inactive:  { bg: 'bg-slate-100',   text: 'text-slate-600',   ring: 'ring-slate-500/20',   dot: 'bg-slate-400'   },
};

export default function StatusBadge({ status }) {
  const c = config[status] ?? config.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
