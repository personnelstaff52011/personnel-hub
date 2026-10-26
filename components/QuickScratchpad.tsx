'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Copy, Check, Download, RotateCcw, Cloud, Sparkles, Code2, BookOpen } from 'lucide-react';
import { useToast } from './ToastContext';
import { copyToClipboard, playChime } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DEFAULT_NOTE = `# 🛰️ สมุดบันทึกภารกิจ (Mission Scratchpad)
- [x] อัปโหลดไฟล์เข้าสู่ Supabase Bucket \`hub-files\`
- [x] สร้างรหัส QR Code แบบเวกเตอร์
- [x] เชื่อมต่อห้องสนทนาเรียลไทม์ (Live Chat)
- [ ] สแกนรับไฟล์ผ่านกล้องมือถือ

*ข้อความจะถูกบันทึกในเครื่องอัตโนมัติ และซิงค์ขึ้น Supabase เมื่อเชื่อมต่อระบบคลาวด์*
`;

export const QuickScratchpad: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_NOTE);
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'local'>('local');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aetherhub_note');
      if (saved) {
        setContent(saved);
      }
      if (isSupabaseConfigured) {
        setSyncStatus('synced');
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aetherhub_note', content);
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured) {
      setSyncStatus('saving');
      const timer = setTimeout(async () => {
        try {
          await supabase.from('notes').upsert([
            {
              id: '00000000-0000-0000-0000-000000000001',
              title: 'บันทึกกำลังพล กองพลทหารช่าง',
              content: content,
              updated_at: new Date().toISOString(),
            },
          ]);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('local');
        }
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      setSyncStatus('local');
    }
  }, [content]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      playChime('click');
      showToast('คัดลอกข้อความในสมุดจดแล้ว', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `บันทึกข้อความ-กองพลทหารช่าง-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    playChime('complete');
    showToast('ดาวน์โหลดเป็นไฟล์ Markdown (.md) แล้ว', 'success');
  };

  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  const charCount = content.length;

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
      {/* Scratchpad Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-glow/10 border border-violet-glow/20 text-violet-soft">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white flex items-center space-x-1.5">
              <span>สมุดจดด่วน (Quick Scratchpad)</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-soft" />
            </h4>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              {syncStatus === 'synced' ? (
                <span className="text-cyan-bright flex items-center space-x-1">
                  <Cloud className="w-3 h-3 text-cyan-neon" />
                  <span>ซิงค์กับ Supabase แล้ว</span>
                </span>
              ) : syncStatus === 'saving' ? (
                <span className="text-amber-300 animate-pulse flex items-center space-x-1">
                  <Cloud className="w-3 h-3" />
                  <span>กำลังส่งข้อมูล...</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center space-x-1">
                  <Cloud className="w-3 h-3" />
                  <span>บันทึกในเครื่อง</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
              viewMode === 'preview'
                ? 'bg-cyan-neon/20 border-cyan-neon/40 text-cyan-bright'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="สลับโหมด แก้ไข / ดูตัวอย่าง"
          >
            {viewMode === 'preview' ? <Code2 className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="คัดลอกข้อความ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-bright" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadMd}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="ดาวน์โหลดเป็น .md"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[220px]">
        {viewMode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="พิมพ์ข้อความด่วน โค้ด โน้ต หรือสิ่งที่ต้องทำ..."
            className="w-full h-56 p-3.5 rounded-2xl glass-input text-xs sm:text-sm font-mono leading-relaxed text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
          />
        ) : (
          <div className="w-full h-56 p-3.5 rounded-2xl glass-panel bg-space-950/60 overflow-y-auto text-xs sm:text-sm text-slate-200 space-y-2 whitespace-pre-wrap font-sans">
            {content || <span className="text-slate-500 italic">ยังไม่มีข้อความบันทึก</span>}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span>{wordCount} คำ</span>
          <span>•</span>
          <span>{charCount} ตัวอักษร</span>
        </div>

        <button
          onClick={() => {
            if (confirm('คุณต้องการรีเซ็ตสมุดจดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
              setContent(DEFAULT_NOTE);
              showToast('รีเซ็ตสมุดจดเรียบร้อย', 'info');
            }
          }}
          className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>รีเซ็ต</span>
        </button>
      </div>
    </div>
  );
};
