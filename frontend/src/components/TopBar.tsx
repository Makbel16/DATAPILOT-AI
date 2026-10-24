import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  UploadCloud,
  Sparkles,
  Database,
  Check,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  onToggleMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileMenu,
  title = 'Dashboard Overview',
  subtitle = 'Welcome back, Alex. Real-time data telemetry.'
}) => {
  const {
    datasets,
    activeDataset,
    setActiveDataset,
    setIsUploadModalOpen,
    isAssistantOpen,
    setIsAssistantOpen,
    notifications,
    dismissNotification,
    loadDemo,
    theme
  } = useApp();

  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`sticky top-0 z-30 h-20 px-4 md:px-8 flex items-center justify-between border-b transition-colors duration-200
        ${theme === 'dark'
          ? 'bg-[#0E1714]/80 backdrop-blur-xl border-[#22312A] text-white'
          : 'bg-white/80 backdrop-blur-xl border-[#E6E9E7] text-[#171918]'
        }
      `}
    >
      {/* Left section: Mobile menu + Page Heading */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-[#95A59E] hover:text-white hover:bg-[#1E2C26] lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#E1E8E5] to-[#A6B2AC] bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xs text-[#7A8A82] font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Middle section: Global Pill Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#69E7B8]/70" />
          <input
            type="text"
            placeholder="Search metrics, columns, queries... [⌘K]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-full bg-[#16241F]/80 border border-[#69E7B8]/20 focus:border-[#69E7B8] focus:ring-1 focus:ring-[#69E7B8] text-white placeholder-[#687870] outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right section: Context Dropdown, Notifications, Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Dataset Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#16241F] border border-[#69E7B8]/30 hover:border-[#69E7B8] text-white transition-all shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-[#69E7B8]" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {activeDataset ? activeDataset.name : 'Select Dataset'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#69E7B8]/80" />
          </button>

          {isDatasetDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#131F1B] border border-[#69E7B8]/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[11px] font-bold text-[#69E7B8] uppercase tracking-wider flex items-center justify-between border-b border-[#25362E]">
                <span>Available Datasets ({datasets.length})</span>
                <button
                  onClick={() => {
                    loadDemo();
                    setIsDatasetDropdownOpen(false);
                  }}
                  className="text-[10px] text-[#69E7B8] hover:underline normal-case font-semibold"
                >
                  Reload Demo
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      setActiveDataset(ds);
                      setIsDatasetDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors
                      ${activeDataset?.id === ds.id
                        ? 'bg-[#69E7B8]/15 text-[#69E7B8] font-bold'
                        : 'text-[#D0DBD5] hover:bg-[#1E2E27]'
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <p className="truncate font-medium">{ds.name}</p>
                      <p className="text-[10px] text-[#71827A]">
                        {ds.row_count.toLocaleString()} rows • {ds.column_count} cols
                      </p>
                    </div>
                    {activeDataset?.id === ds.id && (
                      <Check className="w-4 h-4 text-[#69E7B8] shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#25362E]">
                <button
                  onClick={() => {
                    setIsDatasetDropdownOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1C2C25] hover:bg-[#69E7B8]/20 text-[#69E7B8] text-xs font-semibold transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload New File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-[#16241F] border border-[#69E7B8]/20 hover:border-[#69E7B8]/60 text-[#D0DBD5] hover:text-white transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-[#69E7B8]" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#69E7B8] ring-2 ring-[#0E1714] animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#131F1B] border border-[#69E7B8]/30 shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#25362E]">
                <span className="text-xs font-bold text-white">Notifications ({notifications.length})</span>
                <span className="text-[10px] text-[#69E7B8] uppercase font-semibold">Active Engine</span>
              </div>

              <div className="max-h-64 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#7A8A82] text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-[#1B2A24] border border-[#69E7B8]/15 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{n.title}</p>
                        <p className="text-[11px] text-[#95A59E] mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-[#69E7B8] mt-1 block">{n.timestamp}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-[#687870] hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Drawer Toggle */}
        <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm
            ${isAssistantOpen
              ? 'bg-[#69E7B8] text-[#071B16]'
              : 'bg-[#182B24] border border-[#69E7B8]/40 text-[#69E7B8] hover:bg-[#69E7B8]/20'
            }
          `}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Assistant</span>
        </button>

        {/* Primary Mint Action: Upload Dataset */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#69E7B8] to-[#45DDA8] hover:from-[#45DDA8] hover:to-[#69E7B8] text-[#071B16] shadow-lg shadow-[#69E7B8]/25 hover:shadow-[#69E7B8]/40 transition-all transform active:scale-95"
        >
          <UploadCloud className="w-4 h-4 text-[#071B16]" />
          <span>Upload Dataset</span>
        </button>
      </div>
    </header>
  );
};
