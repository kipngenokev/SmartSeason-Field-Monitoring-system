import { useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import { useApi } from '../../hooks/useApi';

const CROPS = [
  'Maize', 'Wheat', 'Barley', 'Rice', 'Sorghum', 'Soybean',
  'Sunflower', 'Sugarcane', 'Tea', 'Coffee', 'Vegetables', 'Other',
];

const EMPTY = { name: '', crop_type: '', planting_date: '', location: '', size_ha: '', status: 'Active' };

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/15';

export default function CreateFieldModal({ open, onClose, onCreated }) {
  const { request } = useApi();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleClose = () => { setForm(EMPTY); setError(''); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await request('/api/fields', {
        method: 'POST',
        body: JSON.stringify({ ...form, size_ha: parseFloat(form.size_ha) }),
      });
      setForm(EMPTY);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New Field">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Banner */}
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shadow-emerald-500/20">
            <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">New Field</p>
            <p className="text-xs text-emerald-600">Fill in the details to register a field.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Field name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Field Name <span className="text-red-400">*</span>
          </label>
          <input name="name" type="text" required maxLength={150}
            value={form.name} onChange={handleChange}
            placeholder="e.g. North Barley Plot"
            className={inputCls}
          />
        </div>

        {/* Crop type */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Crop Type <span className="text-red-400">*</span>
          </label>
          <select name="crop_type" required value={form.crop_type} onChange={handleChange} className={inputCls}>
            <option value="">— Select a crop —</option>
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Planting date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Planting Date <span className="text-red-400">*</span>
          </label>
          <input name="planting_date" type="date" required
            value={form.planting_date} onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Location <span className="text-red-400">*</span>
          </label>
          <input name="location" type="text" required maxLength={255}
            value={form.location} onChange={handleChange}
            placeholder="e.g. Nakuru, Rift Valley"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Size (ha) <span className="text-red-400">*</span>
            </label>
            <input name="size_ha" type="number" required min="0.1" step="0.1"
              value={form.size_ha} onChange={handleChange}
              placeholder="0.0"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? 'Creating...' : 'Create Field'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
