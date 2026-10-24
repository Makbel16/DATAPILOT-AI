import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { UploadModal } from '../components/UploadModal';
import { AssistantDrawer } from '../components/AssistantDrawer';
import { useApp } from '../context/AppContext';

export const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useApp();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans
        ${theme === 'dark' ? 'bg-[#07130F] text-[#E1E8E5]' : 'bg-[#F3F5F4] text-[#171918]'}
      `}
    >
      {/* Background ambient emerald glow gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#69E7B8]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#087A5C]/15 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#0D261F]/40 rounded-full blur-[180px]" />
      </div>

      {/* Outer Glow Container Shell (DataQuantum Style) */}
      <div className="relative z-10 flex min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300
            ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
          `}
        >
          {/* Top Bar */}
          <TopBar onToggleMobileMenu={() => setMobileSidebarOpen(true)} />

          {/* Page Body */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <UploadModal />
      <AssistantDrawer />
    </div>
  );
};
