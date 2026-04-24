import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Users, MapPin, ClipboardList, Search, UserCircle, Calendar } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Avatar = ({ name, size = 'md' }) => {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const cls = size === 'lg'
    ? 'h-12 w-12 text-base'
    : 'h-9 w-9 text-sm';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 ${cls}`}>
      {initials}
    </span>
  );
};

function AgentCard({ agent }) {
  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/[0.08]">
      <div className="flex items-start gap-4">
        <Avatar name={agent.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-900">{agent.name}</h3>
          <p className="truncate text-sm text-slate-500">{agent.email}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-slate-300" strokeWidth={2} />
            <span className="text-xs text-slate-400">Joined {formatDate(agent.created_at)}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 ring-1 ring-violet-200">
          Agent
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-widest">Fields</p>
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900">{agent.field_count}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-widest">Updates</p>
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900">{agent.update_count}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          agent.field_count > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${agent.field_count > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          {agent.field_count > 0 ? `${agent.field_count} field${agent.field_count !== 1 ? 's' : ''} assigned` : 'No fields assigned'}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-slate-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-44 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="mt-4 h-7 w-32 rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}

export default function AgentsPage() {
  const { request } = useApi();
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await request('/api/users/agents/stats');
      setAgents(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = agents.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  const totalFields  = agents.reduce((s, a) => s + Number(a.field_count),  0);
  const totalUpdates = agents.reduce((s, a) => s + Number(a.update_count), 0);
  const active       = agents.filter((a) => Number(a.field_count) > 0).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Agents</h2>
          <p className="text-sm text-slate-500">All registered field agents and their activity.</p>
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

      {/* Stats strip */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Agents',     value: agents.length },
            { label: 'Active (assigned)', value: active },
            { label: 'Fields Covered',   value: totalFields },
            { label: 'Total Updates',    value: totalUpdates },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && agents.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <UserCircle className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {search ? 'No agents match your search' : 'No agents registered yet'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {search ? 'Try a different name or email.' : 'Agents will appear here once they register.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {filtered.length} agent{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </>
      )}
    </div>
  );
}
