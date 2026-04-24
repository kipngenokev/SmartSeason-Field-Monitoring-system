import { FileText, Sprout } from 'lucide-react';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : null;
};

const Avatar = ({ name }) => {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
      {initials}
    </span>
  );
};

const stageStyle = (stage) => {
  const s = (stage ?? '').toLowerCase();
  if (s.includes('complet'))        return { dot: 'bg-blue-500',    ring: 'ring-blue-200',    chip: 'bg-blue-50 text-blue-700 ring-blue-200'       };
  if (s.includes('harvest'))        return { dot: 'bg-orange-500',  ring: 'ring-orange-200',  chip: 'bg-orange-50 text-orange-700 ring-orange-200'  };
  if (s.includes('plant'))          return { dot: 'bg-emerald-500', ring: 'ring-emerald-200', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200'};
  if (s.includes('irrig'))          return { dot: 'bg-cyan-500',    ring: 'ring-cyan-200',    chip: 'bg-cyan-50 text-cyan-700 ring-cyan-200'        };
  if (s.includes('fertil'))         return { dot: 'bg-yellow-500',  ring: 'ring-yellow-200',  chip: 'bg-yellow-50 text-yellow-700 ring-yellow-200'  };
  if (s.includes('pest')||s.includes('spray')) return { dot: 'bg-red-500', ring: 'ring-red-200', chip: 'bg-red-50 text-red-700 ring-red-200' };
  if (s.includes('land')||s.includes('prep')) return { dot: 'bg-amber-500', ring: 'ring-amber-200', chip: 'bg-amber-50 text-amber-700 ring-amber-200' };
  return { dot: 'bg-slate-400', ring: 'ring-slate-200', chip: 'bg-slate-100 text-slate-600 ring-slate-200' };
};

export default function UpdateTimeline({ updates }) {
  if (!updates.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          <Sprout className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">No updates recorded</p>
        <p className="mt-1 text-xs text-slate-400">Field updates will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />

      <div className="space-y-4">
        {updates.map((update, i) => {
          const s = stageStyle(update.stage);
          const isLatest = i === 0;
          const ago = timeAgo(update.created_at);

          return (
            <div key={update.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-4 ${s.ring} shadow-sm`}>
                <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              </div>

              {/* Card */}
              <div className={`min-w-0 flex-1 rounded-2xl bg-white p-5 shadow-sm ring-1 transition-all duration-200 hover:shadow-md ${
                isLatest ? 'ring-emerald-200/60' : 'ring-black/[0.04]'
              }`}>
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.chip}`}>
                      {update.stage}
                    </span>
                    {isLatest && (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {ago && <p className="text-xs font-semibold text-slate-400">{ago}</p>}
                    <p className="text-[11px] text-slate-300">{formatDate(update.created_at)}</p>
                  </div>
                </div>

                {/* Notes */}
                {update.notes ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{update.notes}</p>
                ) : (
                  <div className="mt-3 flex items-center gap-1.5 text-xs italic text-slate-300">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                    No notes provided
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-50 pt-3">
                  <Avatar name={update.agent_name} />
                  <span className="text-xs font-medium text-slate-500">{update.agent_name}</span>
                  <span className="ml-auto rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    #{update.id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
