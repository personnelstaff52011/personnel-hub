'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Orbit, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/ToastContext';
import { AmbientBackground } from '@/components/AmbientBackground';
import { LatencyBadge } from '@/components/LatencyBadge';
import { Dock } from '@/components/Dock';
import { FileTransferZone } from '@/components/FileTransferZone';
import { FileList } from '@/components/FileList';
import { QrStudio } from '@/components/QrStudio';
import { QuickScratchpad } from '@/components/QuickScratchpad';
import { FocusTimer } from '@/components/FocusTimer';
import { HubFile, ActiveWidget } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveWidget>('all');
  const [files, setFiles] = useState<HubFile[]>([]);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string>('https://aetherhub.vercel.app');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchFiles = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setFiles(data as HubFile[]);
        }
      } else {
        // Fallback: load local mock/saved files
        const saved = localStorage.getItem('aetherhub_local_files');
        if (saved) {
          setFiles(JSON.parse(saved));
        }
      }
    } catch (err: any) {
      console.warn('Failed to load files from Supabase:', err.message);
      const saved = localStorage.getItem('aetherhub_local_files');
      if (saved) {
        setFiles(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUploaded = (newFile: HubFile) => {
    setFiles((prev) => {
      const updated = [newFile, ...prev];
      if (!isSupabaseConfigured) {
        localStorage.setItem('aetherhub_local_files', JSON.stringify(updated));
      }
      return updated;
    });
    setSelectedQrUrl(newFile.public_url);
    showToast(`"${newFile.filename}" uploaded successfully!`, 'success');
  };

  const handleFileDeleted = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (!isSupabaseConfigured) {
        localStorage.setItem('aetherhub_local_files', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('File removed', 'info');
  };

  const handleSelectQrFile = (file: HubFile) => {
    setSelectedQrUrl(file.public_url);
    setActiveTab('qr');
    showToast(`QR loaded for ${file.filename}`, 'info');
  };

  return (
    <div className="relative min-h-screen text-slate-100 pb-32">
      <AmbientBackground />

      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-space-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-glow to-violet-glow flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Orbit className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">AETHERHUB</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Gravity Workspace & Dynamic QR Node</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LatencyBadge />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* File Upload & Ingestion */}
                <div className="lg:col-span-7 space-y-6">
                  <FileTransferZone onFileUploaded={handleFileUploaded} />
                  <FileList
                    files={files}
                    onSelectQrFile={handleSelectQrFile}
                    onFileDeleted={handleFileDeleted}
                  />
                </div>

                {/* QR Studio & Micro-tools */}
                <div className="lg:col-span-5 space-y-6">
                  <QrStudio initialValue={selectedQrUrl} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <FocusTimer />
                    <QuickScratchpad />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <FileTransferZone onFileUploaded={handleFileUploaded} />
              <FileList
                files={files}
                onSelectQrFile={handleSelectQrFile}
                onFileDeleted={handleFileDeleted}
              />
            </motion.div>
          )}

          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto"
            >
              <QrStudio initialValue={selectedQrUrl} />
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto"
            >
              <QuickScratchpad />
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-md mx-auto"
            >
              <FocusTimer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <Dock activeTab={activeTab} setActiveTab={setActiveTab} fileCount={files.length} />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
