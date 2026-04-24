import { useState, useEffect } from 'react';
import { Loader2, UserCircle, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApi } from '../../hooks/useApi';

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/15';

const Avatar = ({ name, size = 'sm' }) => {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const cls = size === 'lg' ? 'h-10 w-10 text-sm' : 'h-7 w-7 text-xs';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 ${cls}`}>
      {initials}
    </span>
  );
};

export default function AssignAgentModal({ open, onClose, field, agents, onAssigned }) {
  const { request } = useApi();
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (open) {
      setAgentId(field?.agent_id ? String(field.agent_id) : '');
      setError('');
    }
  }, [open, field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agentId) return;
    setLoading(true);
    setError('');
    try {
      await request(`/api/fields/${field.id}/assign-agent`, {
        method: 'PATCH',
        body: JSON.stringify({ agentId: parseInt(agentId, 10) }),
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!field) return null;

  const selectedAgent = agents.find((a) => String(a.id) === agentId);

  return (
    <Modal open={open} onClose={onClose} title="Assign Agent" maxWidth="max-w-md">
      <div className="space-y-5">

        {/* Field context */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Field</p>
          <p className="mt-1 font-bold text-slate-900">{field.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {field.crop_type && <>{field.crop_type} &middot; </>}
            {field.location} &middot; {Number(field.size_ha).toFixed(1)} ha
          </p>
        </div>

        {/* Current agent */}
        {field.agent_name ? (
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5">
            <Avatar name={field.agent_name} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Currently assigned</p>
              <p className="text-sm font-bold text-blue-900">{field.agent_name}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <UserCircle className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
            <p className="text-sm font-medium text-amber-700">No agent assigned yet</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Select Agent <span className="text-red-400">*</span>
            </label>

            {agents.length === 0 ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-slate-400">
                <Users className="h-4 w-4 shrink-0" strokeWidth={2} />
                <p className="text-sm">No agent accounts exist yet.</p>
              </div>
            ) : (
              <select
                value={agentId}
                onChange={(e) => { setError(''); setAgentId(e.target.value); }}
                required
                className={inputCls}
              >
                <option value="">— Choose an agent —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            )}
          </div>

          {/* Selected preview */}
          {selectedAgent && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3.5 ring-1 ring-emerald-200">
              <Avatar name={selectedAgent.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-900 truncate">{selectedAgent.name}</p>
                <p className="text-xs text-emerald-600 truncate">{selectedAgent.email}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Agent
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !agentId || agents.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Assigning...' : 'Assign Agent'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
