'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    filename: 'คู่มือภารกิจ-AetherHub.pdf',
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
];

function AetherHubContent() {
  const [activeTab, setActiveTab] = useState<ActiveWidget>('all');
  const [files, setFiles] = useState<HubFile[]>([]);
  const [qrTargetValue, setQrTargetValue] = useState<string>('https://aetherhub.vercel.app');
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const { showToast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFiles((prev) => {
          // If we had demo files or local files, replace or merge
          if (data.length > 0) {
            return data as HubFile[];
          }
          return prev.length > 0 ? prev : DEMO_FILES;
        });
      }
    } catch (err) {
      console.warn('Sync files error:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Initial Load
    fetchFiles();

    if (!isSupabaseConfigured) {
      return;
    }

    // 2. Real-time Channel for Files: Broadcast & Postgres Changes
    const channel = supabase.channel('hub-files-sync', {
      config: { broadcast: { self: false } },
    });

    try {
      channel
        // A: Listen to broadcast from other clients (Instant 0ms latency)
        .on('broadcast', { event: 'new_file' }, (payload) => {
          const incoming = payload.payload as HubFile;
          if (!incoming || !incoming.id) return;
          setFiles((prev) => {
            if (prev.some((f) => f.id === incoming.id)) return prev;
            playChime('upload');
            showToast(`มีไฟล์ใหม่ในวงโคจร: "${incoming.filename}"`, 'info');
            return [incoming, ...prev];
          });
        })
        .on('broadcast', { event: 'delete_file' }, (payload) => {
          const deletedId = (payload.payload as { id: string })?.id;
          if (deletedId) {
            setFiles((prev) => prev.filter((f) => f.id !== deletedId));
          }
        })
        // B: Listen to PostgreSQL changes on `files` table
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'files' },
          (payload) => {
            const incoming = payload.new as HubFile;
            if (!incoming || !incoming.id) return;
            setFiles((prev) => {
              if (prev.some((f) => f.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'files' },
          (payload) => {
            const deletedId = (payload.old as { id: string })?.id;
            if (deletedId) {
              setFiles((prev) => prev.filter((f) => f.id !== deletedId));
            }
          }
        )
        .subscribe();
    } catch (cErr) {
      console.warn('Realtime subscription error:', cErr);
    }

    // 3. Polling Fallback: Refresh files every 4 seconds
    const interval = setInterval(fetchFiles, 4000);

    return () => {
      clearInterval(interval);
      try {
        supabase.removeChannel(channel);
      } catch {
        // Ignore
      }
    };
  }, [fetchFiles, showToast]);

  const handleFileUploaded = (newFile: HubFile) => {
    setFiles((prev) => {
      const updated = [newFile, ...prev.filter((f) => f.id !== newFile.id)];
      return updated;
    });

    // Automatically load the public URL into QR Studio
    setQrTargetValue(newFile.public_url);

    // Broadcast file to other users
    if (isSupabaseConfigured) {
      try {
        const channel = supabase.channel('hub-files-sync');
        channel.send({
          type: 'broadcast',
          event: 'new_file',
          payload: newFile,
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleFileDeleted = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));

    // Broadcast delete to other users
    if (isSupabaseConfigured) {
      try {
        const channel = supabase.channel('hub-files-sync');
        channel.send({
          type: 'broadcast',
          event: 'delete_file',
          payload: { id },
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleSelectQrFile = (file: HubFile) => {
    playChime('click');
    setQrTargetValue(file.public_url);
    setActiveTab('qr');
    showToast(`สร้างรหัส QR สำหรับ "${file.filename}" เรียบร้อย (สแกนได้ทันที)`, 'success');

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
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-violet-glow via-cyan-neon to-cyan-bright p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <div className="w-full h-full rounded-[14px] bg-space-950 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-bright" />
            </div>
          </motion.div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-bright bg-clip-text text-transparent">
                AetherHub
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-glow/20 text-violet-soft border border-violet-glow/30">
                เรียลไทม์ควอนตัม
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              ศูนย์ปฏิบัติการส่งต่อไฟล์ รหัสคิวอาร์ และระบบสื่อสารเรียลไทม์
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
            <span>คำสั่ง SQL (Supabase)</span>
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
                  <span>คำแนะนำการเปิดใช้งาน Realtime Replication บน Supabase</span>
                </div>
                <button
                  onClick={() => setShowSqlGuide(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ปิด
                </button>
              </div>

              <p className="text-slate-300 mb-2">
                ขณะนี้ระบบใช้ช่องสัญญาณ <strong>Realtime Broadcast + Database Replication + Background Polling</strong> ร่วมกันเพื่อให้การแชตและไฟล์ซิงค์แบบเรียลไทม์ 100%:
              </p>

              <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-xs">
                <li>เปิดเมนู SQL Editor บน Supabase แล้วรันคำสั่งใน <span className="text-cyan-bright">`supabase-schema.sql`</span></li>
                <li>ไปที่ <strong>Database</strong> &gt; <strong>Publications</strong> &gt; ตรวจสอบว่า <span className="text-violet-soft">`supabase_realtime`</span> ได้เลือกตาราง <span className="text-cyan-bright">files, messages, notes</span> แล้ว</li>
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
          <span>ระบบส่งต่อไฟล์และแชตสดแบบเรียลไทม์ข้ามทุกอุปกรณ์ (Live Sync)</span>
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
          ลากไฟล์ลงสู่แกนดึงดูดสสาร สร้างคิวอาร์โค้ดสแกนติดง่าย 100% แชตสดร่วมกับสมาชิก และโฟกัสการทำงานในบรรยากาศอวกาศ
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

        {/* VIEW: Micro-Tools */}
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
