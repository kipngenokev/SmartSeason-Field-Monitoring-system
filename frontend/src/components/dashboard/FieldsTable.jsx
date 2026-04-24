import { Link } from 'react-router-dom';
import { MapPin, Clock, UserCircle, UserPlus, Sprout, Calendar } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago`
    : new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Avatar = ({ name }) => {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
      {initials}
    </span>
  );
};

const TH = ({ children }) => (
  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
    {children}
  </th>
);

export default function FieldsTable({ fields, onAssignAgent }) {
  const hasActions = Boolean(onAssignAgent);

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          <MapPin className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">No fields yet</p>
        <p className="mt-1 text-xs text-slate-400">Fields will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <TH>Field</TH>
              <TH>Crop</TH>
              <TH>Planting Date</TH>
              <TH>Current Stage</TH>
              <TH>Location</TH>
              <TH>Size</TH>
              <TH>Status</TH>
              <TH>Agent</TH>
              <TH>Health</TH>
              {hasActions && <TH>Actions</TH>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fields.map((field) => (
              <tr
                key={field.id}
                className="group transition-colors duration-100 hover:bg-emerald-50/40"
              >
                <td className="px-5 py-4">
                  <Link
                    to={`/fields/${field.id}`}
                    className="font-semibold text-slate-900 transition-colors hover:text-emerald-600"
                  >
                    {field.name}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-slate-400">ID #{field.id}</p>
                </td>

                <td className="px-5 py-4">
                  {field.crop_type ? (
                    <div className="flex items-center gap-1.5">
                      <Sprout className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
                      <span className="text-sm text-slate-700">{field.crop_type}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  {field.planting_date ? (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={2} />
                      <span className="text-sm">{formatDate(field.planting_date)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  {field.latest_stage ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {field.latest_stage}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">No updates</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={2} />
                    <span className="max-w-[130px] truncate text-sm">{field.location}</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="font-semibold text-slate-700">{Number(field.size_ha).toFixed(1)}</span>
                  <span className="ml-1 text-xs text-slate-400">ha</span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={field.status} />
                </td>

                <td className="px-5 py-4">
                  {field.agent_name ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={field.agent_name} />
                      <span className="max-w-[110px] truncate text-sm text-slate-700">{field.agent_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <UserCircle className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                      <span className="text-xs text-slate-400">Unassigned</span>
                    </div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={field.computed_status} />
                </td>

                {hasActions && (
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onAssignAgent(field)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
                      {field.agent_name ? 'Reassign' : 'Assign'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-xs text-slate-400">
          {fields.length} field{fields.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
