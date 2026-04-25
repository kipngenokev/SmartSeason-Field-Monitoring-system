import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, AlertTriangle, Clock, RefreshCw, Loader2, ArrowRight, Sparkles, Sprout, Calendar, Layers } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const healthBorder = {
  Active:    'border-l-emerald-400',
  'At Risk': 'border-l-red-400',
  Completed: 'border-l-blue-400',
  Inactive:  'border-l-slate-200',
};

function FieldCard({ field }) {
  const border = healthBorder[field.computed_status] ?? 'border-l-slate-200';
  return (
    <Link
      to={`/fields/${field.id}`}
      className={`group block rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-black/[0.06] border-l-4 ${border}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
              {field.name}
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
              <span className="truncate text-sm">{field.location}</span>
            </div>
          </div>
          <StatusBadge status={field.computed_status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Sprout className="h-3 w-3 text-emerald-400" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Crop</p>
            </div>
            <p className="mt-1 text-sm font-bold text-slate-800">{field.crop_type ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-slate-400" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stage</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {field.latest_stage ?? 'No updates'}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-slate-400" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Planted</p>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              {field.planting_date
                ? new Date(field.planting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-400" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Size</p>
            </div>
            <p className="mt-1 text-sm font-black text-slate-800">
              {Number(field.size_ha).toFixed(1)}
              <span className="ml-1 text-xs font-medium text-slate-400">ha</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-xs">
              {field.latest_update_at ? `Updated ${timeAgo(field.latest_update_at)}` : 'No updates yet'}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
            View <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="mt-4 h-3 w-32 rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const { request } = useApi();
  const [fields, setFields]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await request('/api/fields/mine');
      setFields(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const active = fields.filter((f) => f.computed_status === 'Active').length;
  const atRisk = fields.filter((f) => f.computed_status === 'At Risk').length;

  return (
    <div className="space-y-8">

      {/* Header */}
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
          <p className="text-sm text-slate-500">Your assigned fields for this season.</p>
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button onClick={() => fetchData()} className="mt-1 text-xs text-red-500 underline">Retry</button>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Assigned Fields" value={fields.length} icon={MapPin}       color="text-blue-600"   />
          <StatCard label="Active"          value={active}        icon={TrendingUp}   color="text-green-600"  sub="Updated recently"  />
          <StatCard label="Needs Attention" value={atRisk}        icon={AlertTriangle} color="text-amber-600" sub="At risk status"     />
        </div>
      )}

      {/* Fields grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">My Fields</h3>
          <p className="mt-0.5 text-xs text-slate-400">Click a field to view details and submit updates</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <MapPin className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">No fields assigned yet</p>
            <p className="mt-1 text-xs text-slate-400">Contact your admin to get fields assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => <FieldCard key={field.id} field={field} />)}
          </div>
        )}
      </div>
    </div>
  );
}
