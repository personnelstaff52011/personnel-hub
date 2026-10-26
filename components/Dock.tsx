'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, UploadCloud, QrCode, MessageSquare, FileEdit, Clock } from 'lucide-react';
import { ActiveWidget } from '@/lib/types';
import { playChime } from '@/lib/utils';

interface DockProps {
  activeTab: ActiveWidget;
  setActiveTab: (tab: ActiveWidget) => void;
  fileCount: number;
}

export const Dock: React.FC<DockProps> = ({ activeTab, setActiveTab, fileCount }) => {
  const tabs = [
    { id: 'all' as ActiveWidget, label: 'ทั้งหมด', icon: LayoutGrid },
    { id: 'files' as ActiveWidget, label: 'ส่งต่อไฟล์', icon: UploadCloud, badge: fileCount > 0 ? fileCount : undefined },
    { id: 'qr' as ActiveWidget, label: 'คิวอาร์โค้ด', icon: QrCode },
    { id: 'chat' as ActiveWidget, label: 'แชตสด', icon: MessageSquare },
    { id: 'notes' as ActiveWidget, label: 'สมุดจดด่วน', icon: FileEdit },
    { id: 'timer' as ActiveWidget, label: 'จับเวลาโฟกัส', icon: Clock },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-fit px-3">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center space-x-1 p-1.5 rounded-2xl glass-panel-glow border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playChime('click');
                setActiveTab(tab.id);
              }}
              className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockPill"
                  className="absolute inset-0 bg-gradient-to-r from-violet-glow/30 to-cyan-neon/30 border border-cyan-neon/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`relative z-10 w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'text-cyan-bright scale-110' : 'text-slate-400'
                }`}
              />

              <span className="relative z-10 hidden sm:inline">{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="relative z-10 ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-neon/20 text-cyan-bright border border-cyan-neon/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
