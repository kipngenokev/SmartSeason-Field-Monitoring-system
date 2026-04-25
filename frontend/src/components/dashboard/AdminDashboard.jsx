import { useState, useEffect, useCallback } from 'react';
import { MapPin, Users, TrendingUp, AlertTriangle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../ui/StatCard';
import FieldsTable from './FieldsTable';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-2.5 w-20 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-8 w-14 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-2.5 w-28 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-3.5 w-40 rounded-full bg-slate-100 animate-pulse" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-6 border-b border-slate-50 px-5 py-4 last:border-0">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-2.5 w-20 rounded-full bg-slate-100 animate-pulse" />
          </div>
          {[1,2,3,4].map(j => (
            <div key={j} className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { request } = useApi();
  const [fields, setFields]   = useState([]);
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [fRes, aRes] = await Promise.all([
        request('/api/fields'),
        request('/api/users/agents'),
      ]);
      setFields(fRes.data);
      setAgents(aRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const active    = fields.filter((f) => f.computed_status === 'Active').length;
  const atRisk    = fields.filter((f) => f.computed_status === 'At Risk').length;
  const completed = fields.filter((f) => f.computed_status === 'Completed').length;

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {greeting()}, {user.name.split(' ')[0]}
            </h2>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Live overview of all fields and agents across the platform.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button onClick={() => fetchData()} className="mt-1 text-xs text-red-500 underline hover:no-underline">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Fields"  value={fields.length} icon={MapPin}         color="text-blue-600"   sub={`${completed} completed`}                      />
          <StatCard label="Active Fields" value={active}        icon={TrendingUp}      color="text-green-600"  sub="Updated within 7 days"                         />
          <StatCard label="At Risk"       value={atRisk}        icon={AlertTriangle}   color="text-amber-600"  sub="Need attention"                                />
          <StatCard label="Total Agents"  value={agents.length} icon={Users}           color="text-purple-600" sub={`${fields.filter(f=>f.agent_id).length} fields assigned`} />
        </div>
      )}

      {/* Fields table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">All Fields</h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete view of every monitored field</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </div>
          )}
        </div>
        {loading ? <SkeletonTable /> : <FieldsTable fields={fields} />}
      </div>
    </div>
  );
}
