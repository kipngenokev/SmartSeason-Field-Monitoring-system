import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Ruler, User, Calendar,
  RefreshCw, Loader2, ClipboardList, Lock, Sprout, Layers,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import UpdateTimeline from '../components/fields/UpdateTimeline';
import AddUpdateForm from '../components/fields/AddUpdateForm';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

const Avatar = ({ name }) => {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
      {initials}
    </span>
  );
};

function MetricTile({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
      {children}
    </div>
  );
}

function SkeletonHero() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="h-1.5 bg-slate-100 animate-pulse" />
      <div className="space-y-5 p-6">
        <div className="flex justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-7 w-56 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-4 w-36 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}

export default function FieldDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request } = useApi();

  const [field, setField]   = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin         = user?.role === 'Admin';
  const isAssignedAgent = !isAdmin && field?.agent_id === user?.id;

  const fetchField = useCallback(async () => {
    try {
      const res = await request(`/api/fields/${id}`);
      setField(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUpdates = useCallback(async (silent = false) => {
    if (!silent) setUpdatesLoading(true);
    try {
      const res = await request(`/api/fields/${id}/updates`);
      setUpdates(res.data);
    } catch { /* silent */ } finally {
      setUpdatesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchField();
    fetchUpdates();
  }, [fetchField, fetchUpdates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchField(), fetchUpdates(true)]);
    setRefreshing(false);
  };

  const backTo    = isAdmin ? '/fields'    : '/dashboard';
  const backLabel = isAdmin ? 'Back to Fields' : 'Back to Dashboard';

  if (error) {
    return (
      <div className="space-y-6">
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {backLabel}
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button onClick={() => navigate(backTo)} className="mt-4 text-sm text-red-500 underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {backLabel}
        </Link>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {/* Hero card */}
      {loading ? <SkeletonHero /> : field && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400" />

          <div className="p-6">
            {/* Title */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{field.name}</h1>
                <div className="mt-1.5 flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                  <span className="text-sm">{field.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={field.status} />
                <StatusBadge status={field.computed_status} />
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <MetricTile icon={Sprout} label="Crop">
                <p className="mt-0.5 text-sm font-semibold text-slate-800">{field.crop_type ?? '—'}</p>
              </MetricTile>

              <MetricTile icon={Calendar} label="Planting Date">
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {field.planting_date ? formatDate(field.planting_date) : '—'}
                </p>
              </MetricTile>

              <MetricTile icon={Layers} label="Current Stage">
                {field.latest_stage ? (
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    {field.latest_stage}
                  </span>
                ) : (
                  <p className="mt-0.5 text-sm font-medium text-slate-400">No updates</p>
                )}
              </MetricTile>

              <MetricTile icon={Ruler} label="Size">
                <p className="text-2xl font-black text-slate-900">
                  {Number(field.size_ha).toFixed(1)}
                  <span className="ml-1 text-sm font-medium text-slate-400">ha</span>
                </p>
              </MetricTile>

              <MetricTile icon={ClipboardList} label="Updates">
                <p className="text-2xl font-black text-slate-900">
                  {updatesLoading ? '—' : updates.length}
                </p>
              </MetricTile>

              <MetricTile icon={User} label="Agent">
                {field.agent_name ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar name={field.agent_name} />
                    <span className="truncate text-sm font-semibold text-slate-800">{field.agent_name}</span>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm font-medium text-slate-400">Unassigned</p>
                )}
              </MetricTile>
            </div>
          </div>
        </div>
      )}

      {/* Agent update form — full width, above timeline so it's always visible */}
      {isAssignedAgent && (
        <AddUpdateForm
          fieldId={id}
          onSubmitted={async () => {
            await Promise.all([fetchField(), fetchUpdates(true)]);
          }}
        />
      )}

      {/* View-only notice for non-assigned agents */}
      {!isAdmin && !isAssignedAgent && field && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} />
          <div>
            <p className="text-sm font-bold text-amber-800">View only</p>
            <p className="mt-0.5 text-xs text-amber-600">
              You are not assigned to this field and cannot submit updates.
            </p>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Timeline — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Update History</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {updatesLoading ? 'Loading...' : `${updates.length} update${updates.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>

          {updatesLoading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]">
                    <div className="flex justify-between gap-4">
                      <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-3 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-50 pt-3">
                      <div className="h-6 w-6 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <UpdateTimeline updates={updates} />
          )}
        </div>

        {/* Right column — field info (admin only) */}
        {isAdmin && field && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] space-y-1">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Field Information</h3>
              {[
                { label: 'Field ID',      value: `#${field.id}` },
                { label: 'Crop Type',     value: field.crop_type ?? '—' },
                { label: 'Planting Date', value: field.planting_date ? formatDate(field.planting_date) : '—' },
                { label: 'Current Stage', value: field.latest_stage ?? 'No updates' },
                { label: 'Status',        value: field.status },
                { label: 'Season Health', value: field.computed_status },
                { label: 'Size',          value: `${Number(field.size_ha).toFixed(2)} ha` },
                { label: 'Agent',         value: field.agent_name ?? 'Unassigned' },
                { label: 'Agent Email',   value: field.agent_email ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-50 py-2.5 last:border-0">
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                  <span className="max-w-[58%] truncate text-right text-xs font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
