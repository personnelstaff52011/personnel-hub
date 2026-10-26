'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Database,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { AmbientBackground } from '@/components/AmbientBackground';
import { LatencyBadge } from '@/components/LatencyBadge';
import { Dock } from '@/components/Dock';
import { FileTransferZone } from '@/components/FileTransferZone';
import { FileList } from '@/components/FileList';
import { QrStudio } from '@/components/QrStudio';
import { LiveChat } from '@/components/LiveChat';
import { QuickScratchpad } from '@/components/QuickScratchpad';
import { FocusTimer } from '@/components/FocusTimer';
import { ToastProvider, useToast } from '@/components/ToastContext';
import { HubFile, ActiveWidget } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { playChime } from '@/lib/utils';

const DEMO_FILES: HubFile[] = [
  {
    id: 'demo-1',
    filename: 'คู่มือกำลังพล-กองพลทหารช่าง.pdf',
    file_size: 2450000,
    mime_type: 'application/pdf',
    public_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'demo-2',
    filename: 'พิกัดและข้อมูลดาราศาสตร์.json',
    file_size: 48900,
    mime_type: 'application/json',
    public_url: 'https://raw.githubusercontent.com/vercel/next.js/canary/package.json',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'demo-3',
    filename: 'ภาพถ่ายเนบิวลา_Supernova.webp',
    file_size: 3820000,
    mime_type: 'image/webp',
    public_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

function AetherHubContent() {
  const [activeTab, setActiveTab] = useState<ActiveWidget>('all');
  const [files, setFiles] = useState<HubFile[]>([]);
  const [qrTargetValue, setQrTargetValue] = useState<string>('https://aetherhub.vercel.app');
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadFiles() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('files')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setFiles(data as HubFile[]);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch from Supabase:', err);
        }
      }

      try {
        const localCached = localStorage.getItem('aetherhub_local_files');
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFiles(parsed);
            return;
          }
        }
      } catch {
        // Ignore
      }

      setFiles(DEMO_FILES);
    }

    loadFiles();
  }, []);

  const handleFileUploaded = (newFile: HubFile) => {
    setFiles((prev) => {
      const updated = [newFile, ...prev.filter((f) => f.id !== newFile.id)];
      try {
        localStorage.setItem('aetherhub_local_files', JSON.stringify(updated.slice(0, 15)));
      } catch {
        // Ignore
      }
      return updated;
    });

    setQrTargetValue(newFile.public_url);
  };

  const handleFileDeleted = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem('aetherhub_local_files', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleSelectQrFile = (file: HubFile) => {
    playChime('click');
    setQrTargetValue(file.public_url);
    setActiveTab('qr');
    showToast(`โหลดลิงก์ "${file.filename}" เข้าสู่ QR Studio เรียบร้อย`, 'info');

    const qrElement = document.getElementById('qr-studio-section');
    if (qrElement) {
      qrElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen pb-32 text-slate-100 flex flex-col">
      <AmbientBackground />

      {/* Header */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <motion.div
            animate={{
              y: [0, -3, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-amber-600/40 shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-amber-400/40 flex items-center justify-center bg-space-950/80 backdrop-blur-md"
          >
            <img
              src="/logo.png"
              alt="ตราสัญลักษณ์ กองพลทหารช่าง"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            />
          </motion.div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-white to-amber-300 bg-clip-text text-transparent">
                ครอบครัว กำลังพล กองพลทหารช่าง
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ระบบสารสนเทศ
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              ศูนย์บริการไฟล์ ส่งต่อรหัสคิวอาร์ และระบบสื่อสารกำลังพล กองพลทหารช่าง
            </p>
          </div>
        </div>

        {/* Latency & Setup */}
        <div className="flex items-center space-x-3">
          <LatencyBadge />

          <button
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-neon" />
            <span>ตั้งค่า Supabase</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSqlGuide ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </header>

      {/* Supabase Guide Accordion */}
      <AnimatePresence>
        {showSqlGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 mt-4 w-full overflow-hidden"
          >
            <div className="p-5 rounded-2xl glass-panel-glow border-cyan-neon/30 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-cyan-bright font-semibold">
                  <Database className="w-4 h-4" />
                  <span>ขั้นตอนการเชื่อมต่อฐานข้อมูล Supabase</span>
                </div>
                <button
                  onClick={() => setShowSqlGuide(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ปิด
                </button>
              </div>

              <p className="text-slate-300 mb-2">
                คุณสามารถนำสคริปต์ในไฟล์ <code className="text-cyan-bright bg-space-850 px-1.5 py-0.5 rounded">supabase-schema.sql</code> ไปวางในเมนู SQL Editor บน Supabase เพื่อสร้างระบบทั้งหมด:
              </p>

              <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-xs">
                <li>สร้าง Storage Bucket ชื่อ <span className="text-cyan-bright">`hub-files`</span> สำหรับอัปโหลดไฟล์</li>
                <li>สร้างตาราง <span className="text-violet-soft">`files`</span>, <span className="text-violet-soft">`notes`</span>, และ <span className="text-cyan-bright">`messages`</span> (ระบบแชต)</li>
                <li>กำหนดค่าความปลอดภัย (RLS) และเปิดใช้งาน Supabase Realtime พร้อมใช้งานทันที</li>
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Atmosphere */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border-cyan-neon/30 text-xs font-medium text-cyan-bright mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>ระบบคลาวด์ส่งต่อข้อมูลไร้แรงโน้มถ่วง &amp; การสื่อสารเรียลไทม์</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight"
        >
          ส่งต่อข้อมูลของคุณสู่{' '}
          <span className="bg-gradient-to-r from-violet-soft via-cyan-bright to-cyan-electric bg-clip-text text-transparent">
            วงโคจรไร้แรงโน้มถ่วง
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-3"
        >
          ลากไฟล์ลงสู่แกนดึงดูดสสาร สร้างคิวอาร์โค้ดส่งต่อทันที แชตสดร่วมกับสมาชิก และโฟกัสการทำงานในบรรยากาศอวกาศ
        </motion.p>
      </section>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-8 flex-1 w-full">
        {/* VIEW: All or Files */}
        {(activeTab === 'all' || activeTab === 'files') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <FileTransferZone onFileUploaded={handleFileUploaded} />
            <FileList
              files={files}
              onSelectQrFile={handleSelectQrFile}
              onFileDeleted={handleFileDeleted}
            />
          </motion.section>
        )}

        {/* VIEW: All or QR Studio */}
        {(activeTab === 'all' || activeTab === 'qr') && (
          <motion.section
            id="qr-studio-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <QrStudio initialValue={qrTargetValue} />
          </motion.section>
        )}

        {/* VIEW: Live Chat */}
        {(activeTab === 'all' || activeTab === 'chat') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LiveChat />
          </motion.section>
        )}

        {/* VIEW: Micro-Tools (Scratchpad + Focus Hub) */}
        {(activeTab === 'all' || activeTab === 'notes' || activeTab === 'timer') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`grid gap-6 ${
              activeTab === 'all'
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {(activeTab === 'all' || activeTab === 'notes') && <QuickScratchpad />}
            {(activeTab === 'all' || activeTab === 'timer') && <FocusTimer />}
          </motion.section>
        )}
      </main>

      {/* Floating Bottom Dock */}
      <Dock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fileCount={files.length}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AetherHubContent />
    </ToastProvider>
  );
}
