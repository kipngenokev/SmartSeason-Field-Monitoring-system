import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Users, ClipboardList, Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fields',    icon: MapPin,          label: 'Fields'    },
  { to: '/updates',   icon: ClipboardList,   label: 'Updates'   },
  { to: '/agents',    icon: Users,           label: 'Agents'    },
];

const agentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/updates',   icon: ClipboardList,   label: 'My Updates' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role === 'Admin' ? adminNav : agentNav;
  const isAdmin  = user?.role === 'Admin';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-900/40">
          <Leaf className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-white">SmartSeason</p>
          <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            isAdmin
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-violet-500/20 text-violet-400'
          }`}>
            {isAdmin ? 'Administrator' : 'Field Agent'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>

        <div className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                  )}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-semibold text-slate-300">Season Active</p>
          </div>
          <p className="mt-1 pl-4 text-[11px] text-slate-600">Monitoring in progress</p>
        </div>
      </div>
    </aside>
  );
}
