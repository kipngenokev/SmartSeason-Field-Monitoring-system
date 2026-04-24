import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Loader2, FileText, MapPin, Clock, Sprout, Search } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

const stageStyle = (stage) => {
  const s = (stage ?? '').toLowerCase();
  if (s.includes('complet'))               return 'bg-blue-50 text-blue-700 ring-blue-200';
  if (s.includes('harvest'))              return 'bg-orange-50 text-orange-700 ring-orange-200';
  if (s.includes('plant'))               return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (s.includes('irrig'))               return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
  if (s.includes('fertil'))              return 'bg-yellow-50 text-yellow-700 ring-yellow-200';
  if (s.includes('pest') || s.includes('spray')) return 'bg-red-50 text-red-700 ring-red-200';
  if (s.includes('land') || s.includes('prep'))  return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
};

const Avatar = ({ name }) => {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
      {initials}
    </span>
  );
};

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 border-b border-slate-50 px-5 py-4 last:border-0">
      <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-3">
          <div className="h-3.5 w-28 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3.5 w-16 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-3 w-48 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-full max-w-xs rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="h-3 w-14 shrink-0 rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}

export default function UpdatesPage() {
  const { user } = useAuth();
  const { request } = useApi();
  const isAdmin = user?.role === 'Admin';

  const [updates, setUpdates]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await request('/api/updates');
      setUpdates(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = updates.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.stage?.toLowerCase().includes(q) ||
      u.field_name?.toLowerCase().includes(q) ||
      u.agent_name?.toLowerCase().includes(q) ||
      u.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {isAdmin ? 'All Field Updates' : 'My Updates'}
          </h2>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? 'Every update submitted across all monitored fields.'
              : 'Updates you have submitted across your assigned fields.'}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button onClick={() => fetchData()} className="mt-1 text-xs text-red-500 underline">Retry</button>
          </div>
        </div>
      )}

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Updates', value: updates.length },
            { label: 'This Week',     value: updates.filter(u => Date.now() - new Date(u.created_at) < 7*86400000).length },
            { label: 'Fields Covered', value: new Set(updates.map(u => u.field_id)).size },
            { label: 'Unique Stages',  value: new Set(updates.map(u => u.stage)).size },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && updates.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by stage, field, agent, or notes…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
          />
        </div>
      )}

      {/* Updates list */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
            <div className="h-3 w-40 rounded-full bg-slate-200 animate-pulse" />
          </div>
          {[1,2,3,4,5].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <Sprout className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {search ? 'No updates match your search' : 'No updates yet'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {search ? 'Try a different keyword.' : 'Updates will appear here once agents submit them.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
            <p className="text-xs font-semibold text-slate-500">
              {filtered.length} update{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3 w-3" strokeWidth={2} />
              Newest first
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((update) => {
              const chipCls = stageStyle(update.stage);
              const ago = timeAgo(update.created_at);

              return (
                <div key={update.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                  <Avatar name={update.agent_name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${chipCls}`}>
                        {update.stage}
                      </span>
                      <Link
                        to={`/fields/${update.field_id}`}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-emerald-600"
                      >
                        <MapPin className="h-3 w-3" strokeWidth={2} />
                        {update.field_name}
                      </Link>
                      {isAdmin && (
                        <span className="text-xs text-slate-400">by {update.agent_name}</span>
                      )}
                    </div>

                    {update.notes ? (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 line-clamp-2">{update.notes}</p>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs italic text-slate-300">
                        <FileText className="h-3 w-3" strokeWidth={1.5} />
                        No notes
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {ago && <p className="text-xs font-semibold text-slate-400">{ago}</p>}
                    <p className="mt-0.5 text-[11px] text-slate-300">{formatDate(update.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
