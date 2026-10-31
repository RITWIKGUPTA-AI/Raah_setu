import React from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Truck,
  PackageCheck,
  Route,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  ShieldCheck,
  Bell,
  MapPin,
  ClipboardList,
  ShieldAlert,
  BarChart3,
  Map,
  Building2,
  Smartphone,
  Palette,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AppTheme } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  criticalIncidentCount: number;
  activeVehicleCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
  criticalIncidentCount,
}) => {
  const { theme, setTheme, themeOptions } = useTheme();

  const navItems = [
    {
      id: 'command',
      label: 'Command Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'live',
      label: 'Live Operations',
      icon: Map,
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: AlertTriangle,
      badge: criticalIncidentCount > 0 ? `${criticalIncidentCount}` : undefined,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'fleet',
      label: 'Fleet Tracking',
      icon: Truck,
    },
    {
      id: 'logistics',
      label: 'Logistics',
      icon: PackageCheck,
    },
    {
      id: 'routes',
      label: 'Route Intelligence',
      icon: Route,
    },
    {
      id: 'ai-risk',
      label: 'AI Risk Intelligence',
      icon: ShieldAlert,
      badge: '12 high',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'districts',
      label: 'District Monitoring',
      icon: Building2,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: '5 new',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'field-reports',
      label: 'Field Reports',
      icon: Smartphone,
      badge: '12 sync',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="vector-global-sidebar"
      className={`relative z-30 flex flex-col justify-between border-r border-slate-200 bg-white text-slate-700 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-[230px]'
      } shrink-0 select-none shadow-xs`}
    >
      {/* Top Brand / Header */}
      <div>
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-wider text-slate-900 uppercase font-mono leading-tight">
                  VECTOR
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-normal leading-tight">
                  Govt Logistics & Ops
                </span>
              </div>
            )}
          </div>

          <button
            id="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-2.5">
          <div className="mb-1.5 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {!collapsed ? 'Operational Views' : '•••'}
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id || (item.id === 'live-ops' && activeNav === 'gis');
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    } ${!collapsed ? 'mr-2.5' : 'mx-auto'}`}
                  />
                  {!collapsed && (
                    <span className="flex flex-1 items-center justify-between truncate text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-2 rounded border px-1.5 py-0.2 font-mono text-[9px] font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r bg-blue-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Theme Switcher, Settings & Officer Profile */}
      <div className="border-t border-slate-200 p-2.5 space-y-2 bg-slate-50/50">
        {/* Background Color Switcher */}
        {!collapsed ? (
          <div className="rounded-md border border-slate-200 bg-white p-2 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Palette className="h-3 w-3 text-blue-600" />
                <span>Background</span>
              </div>
              <span className="text-[10px] font-medium text-slate-600 capitalize">
                {themeOptions.find((t) => t.id === theme)?.name}
              </span>
            </div>

            {/* 5 Swatch Buttons */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`sidebar-theme-${opt.id}`}
                    onClick={() => setTheme(opt.id)}
                    title={`${opt.name}: ${opt.subtitle}`}
                    className={`group relative flex flex-col items-center justify-center p-1 rounded transition-all ${
                      isActive
                        ? 'bg-blue-50/70 ring-1.5 ring-blue-500'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border shadow-2xs transition-transform group-hover:scale-110 flex items-center justify-center ${
                        isActive ? 'ring-1 ring-blue-600 ring-offset-1' : ''
                      }`}
                      style={{
                        backgroundColor: opt.colorSwatch,
                        borderColor: opt.borderHex,
                      }}
                    >
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: opt.isDark ? '#38BDF8' : '#2563EB' }}
                        />
                      )}
                    </span>
                    <span className="text-[8px] text-slate-500 mt-1 truncate max-w-[28px] text-center font-medium">
                      {opt.id === 'white' ? 'White' : opt.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                const ids: AppTheme[] = ['white', 'dark', 'bone', 'powder', 'frost'];
                const currIdx = ids.indexOf(theme);
                const nextTheme = ids[(currIdx + 1) % ids.length];
                setTheme(nextTheme);
              }}
              title={`Theme: ${themeOptions.find((t) => t.id === theme)?.name} (Click to cycle)`}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white shadow-2xs hover:bg-slate-100 transition-colors"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-400"
                style={{
                  backgroundColor: themeOptions.find((t) => t.id === theme)?.colorSwatch,
                }}
              />
            </button>
          </div>
        )}

        <button
          onClick={() => onSelectNav('settings')}
          className="flex w-full items-center rounded-md px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className={`h-3.5 w-3.5 shrink-0 text-slate-400 ${!collapsed ? 'mr-2.5' : 'mx-auto'}`} />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>

        <div className="pt-0.5">
          {!collapsed ? (
            <div className="flex items-center space-x-2.5 rounded-md border border-slate-200 bg-white p-2 shadow-2xs">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col truncate text-[11px] leading-tight">
                <span className="truncate font-semibold text-slate-900">
                  Col. R. Bhattacharya
                </span>
                <span className="truncate text-[10px] text-slate-500">
                  Director Ops • NE Command
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Col. R. Bhattacharya">
              <User className="h-4 w-4 text-slate-500" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

