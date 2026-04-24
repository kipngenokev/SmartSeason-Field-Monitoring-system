import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Loader2, MapPin, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import FieldsTable from '../components/dashboard/FieldsTable';
import CreateFieldModal from '../components/fields/CreateFieldModal';
import AssignAgentModal from '../components/fields/AssignAgentModal';
import StatCard from '../components/ui/StatCard';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-6 border-b border-slate-50 px-5 py-4">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-36 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-16 rounded-full bg-slate-100 animate-pulse" />
      </div>
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function FieldsPage() {
  const { request } = useApi();
  const [fields, setFields]     = useState([]);
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);
  const [createOpen, setCreateOpen]   = useState(false);
  const [assignField, setAssignField] = useState(null);

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

  const active   = fields.filter((f) => f.computed_status === 'Active').length;
  const atRisk   = fields.filter((f) => f.computed_status === 'At Risk').length;
  const assigned = fields.filter((f) => f.agent_id).length;

  return (
    <>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Fields</h2>
            <p className="text-sm text-slate-500">
              Manage, monitor, and assign agents to all agricultural fields.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Field
            </button>
          </div>
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

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Fields" value={fields.length} icon={MapPin}       color="text-blue-600"   />
            <StatCard label="Active"       value={active}        icon={TrendingUp}   color="text-green-600"  />
            <StatCard label="At Risk"      value={atRisk}        icon={AlertTriangle} color="text-amber-600" />
            <StatCard label="Assigned"     value={assigned}      icon={Users}         color="text-purple-600"
              sub={`${fields.length - assigned} unassigned`}
            />
          </div>
        )}

        {/* Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">All Fields</h3>
              <p className="mt-0.5 text-xs text-slate-400">Click a field name to view its details</p>
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

          {loading ? (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                <div className="h-3 w-48 rounded-full bg-slate-200 animate-pulse" />
              </div>
              {[1,2,3,4,5].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <FieldsTable
              fields={fields}
              onAssignAgent={(field) => setAssignField(field)}
            />
          )}
        </div>
      </div>

      <CreateFieldModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchData(true)}
      />
      <AssignAgentModal
        open={!!assignField}
        onClose={() => setAssignField(null)}
        field={assignField}
        agents={agents}
        onAssigned={() => fetchData(true)}
      />
    </>
  );
}
