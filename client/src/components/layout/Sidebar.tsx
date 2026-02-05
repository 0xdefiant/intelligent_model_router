import { NavLink } from 'react-router-dom';
import { Zap, ShieldAlert, FileCheck, LayoutDashboard } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/router', icon: Zap, label: 'Model Router' },
  { to: '/anomalies', icon: ShieldAlert, label: 'Anomaly Detection' },
  { to: '/policy', icon: FileCheck, label: 'Policy Agent' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-ramp-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-ramp-gray-200">
        <h1 className="text-xl font-bold text-ramp-gray-900 tracking-tight">
          <span className="text-ramp-green">Ramp</span> Intelligence
        </h1>
        <p className="text-xs text-ramp-gray-500 mt-1">Multi-Model Expense System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ramp-green/10 text-ramp-green border-l-2 border-ramp-green'
                  : 'text-ramp-gray-600 hover:bg-ramp-gray-100 hover:text-ramp-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-ramp-gray-200">
        <p className="text-xs text-ramp-gray-400">Powered by multi-model AI orchestration</p>
      </div>
    </aside>
  );
}
