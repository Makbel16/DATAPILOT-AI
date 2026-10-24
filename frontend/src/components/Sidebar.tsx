import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Database,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  FileText,
  History,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile
}) => {
  const { theme, toggleTheme, activeDataset, isAssistantOpen, setIsAssistantOpen } = useApp();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Data', path: '/analyze', icon: Sparkles, badge: 'AI' },
    { name: 'My Datasets', path: '/datasets', icon: Database },
    { name: 'Visualizations', path: '/visualizations', icon: BarChart3 },
    { name: 'Forecasts', path: '/forecasts', icon: TrendingUp },
    { name: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Analysis History', path: '/history', icon: History },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r
          ${theme === 'dark' 
            ? 'bg-[#181C1A] border-[#2C3833] text-[#A6B2AC]' 
            : 'bg-white border-[#E6E9E7] text-[#555C58]'}
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand / Logo */}
        <div className="h-20 flex items-center px-5 border-b border-inherit gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#69E7B8] via-[#087A5C] to-[#071B16] p-0.5 shadow-lg shadow-[#69E7B8]/20">
            <div className="w-full h-full bg-[#0D1814] rounded-[10px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#69E7B8] animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#69E7B8] rounded-full ring-2 ring-[#0D1814]" />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-[#E1E8E5] to-[#69E7B8] bg-clip-text text-transparent">
                DATAPILOT AI
              </span>
              <span className="text-[11px] font-medium text-[#69E7B8]/80 tracking-wider uppercase">
                SaaS Analytics
              </span>
            </div>
          )}
        </div>

        {/* Current Dataset Context Widget (if not collapsed) */}
        {!collapsed && activeDataset && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-[#222B27]/60 border border-[#69E7B8]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-[#69E7B8] ring-4 ring-[#69E7B8]/20 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-semibold text-[#69E7B8] tracking-wider truncate">Active Dataset</p>
                <p className="text-xs font-medium text-white truncate">{activeDataset.name}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-[#14231E] px-1.5 py-0.5 rounded text-[#69E7B8] border border-[#69E7B8]/30">
              {activeDataset.row_count > 1000 ? `${(activeDataset.row_count / 1000).toFixed(1)}k` : activeDataset.row_count}
            </span>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#69E7B8]/70 ${collapsed ? 'hidden' : 'block'}`}>
            Analytics Core
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-[#69E7B8]/15 text-[#69E7B8] font-semibold shadow-[0_0_20px_-3px_rgba(105,231,184,0.3)] border border-[#69E7B8]/30'
                    : 'hover:bg-[#25322C]/40 hover:text-white text-[#95A59E]'
                  }
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#69E7B8]' : 'text-inherit'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#69E7B8] text-[#071B16] shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#69E7B8] rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className={`pt-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#69E7B8]/70 ${collapsed ? 'hidden' : 'block'}`}>
            Preferences
          </div>

          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-[#69E7B8]/15 text-[#69E7B8] font-semibold border border-[#69E7B8]/30'
                    : 'hover:bg-[#25322C]/40 hover:text-white text-[#95A59E]'
                  }
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}

          {/* Quick AI Assistant Button in Sidebar */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`w-full mt-2 flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isAssistantOpen ? 'bg-[#69E7B8] text-[#071B16] font-semibold' : 'bg-[#152720] text-[#69E7B8] hover:bg-[#1C362C] border border-[#69E7B8]/30'}
              ${collapsed ? 'justify-center px-2' : ''}
            `}
          >
            <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
            {!collapsed && <span className="truncate">DataPilot Assistant</span>}
          </button>
        </div>

        {/* Footer: User Profile & Theme Toggle */}
        <div className="p-4 border-t border-inherit space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative w-9 h-9 rounded-full bg-[#1A3329] border border-[#69E7B8]/40 flex items-center justify-center font-bold text-sm text-[#69E7B8]">
                AR
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#69E7B8] border-2 border-[#181C1A] rounded-full" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">Alex R.</p>
                  <p className="text-xs text-[#69E7B8]">Pro Plan</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[#25322C]/60 hover:bg-[#69E7B8]/20 text-[#A6B2AC] hover:text-[#69E7B8] transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
