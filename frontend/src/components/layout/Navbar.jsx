import { Bell, Search, ChevronDown, LogOut, Settings, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title = 'Dashboard', onMenuClick = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  const isAdmin = user?.role === 'Admin';

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:left-64">

      {/* Left — hamburger + page title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold text-slate-900">{title}</h1>
          <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex shrink-0 items-center gap-2">

        {/* Search — hidden on small mobile */}
        <button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-600 md:flex">
          <Search className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="ml-1 hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-sm ring-1 ring-slate-200 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
          <Bell className="h-4 w-4" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-[11px] font-bold uppercase shadow-sm ${
              isAdmin ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 'bg-gradient-to-br from-violet-400 to-purple-600'
            }`}>
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800">{user?.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 sm:block ${menuOpen ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-black/[0.08]">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
                <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'
                }`}>
                  {user?.role}
                </span>
              </div>
              <div className="p-1">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                  <Settings className="h-4 w-4" strokeWidth={2} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
