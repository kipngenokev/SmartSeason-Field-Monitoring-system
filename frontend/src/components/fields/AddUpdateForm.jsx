import { useState } from 'react';
import { Loader2, Send, Zap, CheckCircle2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const QUICK_STAGES = [
  'Land Preparation', 'Planting', 'Irrigation',
  'Fertilizing', 'Pest Control', 'Harvesting', 'Completed',
];

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/15';

export default function AddUpdateForm({ fieldId, onSubmitted }) {
  const { request } = useApi();
  const [stage, setStage]     = useState('');
  const [notes, setNotes]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stage.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await request(`/api/fields/${fieldId}/updates`, {
        method: 'POST',
        body: JSON.stringify({ stage: stage.trim(), notes: notes.trim() || undefined }),
      });
      setStage('');
      setNotes('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shadow-emerald-500/20">
            <Send className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Submit Update</h3>
            <p className="text-xs text-slate-400">Record a new field activity</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
            <p className="text-sm font-medium text-emerald-700">Update submitted successfully.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Quick stage chips */}
        <div>
          <div className="mb-2.5 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick select</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStage(s); setError(''); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  stage === s
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stage input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Season Stage <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={stage}
            onChange={(e) => { setStage(e.target.value); setError(''); }}
            placeholder="e.g. Land Preparation, Planting..."
            className={inputCls}
          />
          <p className="text-right text-[10px] text-slate-300">{stage.length}/100</p>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Notes{' '}
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the activity, observations, or issues..."
            className={`${inputCls} resize-none`}
          />
          <p className="text-right text-[10px] text-slate-300">{notes.length}/2000</p>
        </div>

        <button
          type="submit"
          disabled={loading || !stage.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</>
            : <><Send className="h-3.5 w-3.5" strokeWidth={2.5} /> Submit Update</>}
        </button>
      </form>
    </div>
  );
}
