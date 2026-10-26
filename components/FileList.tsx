'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileImage,
  FileCode,
  FileArchive,
  Music,
  Video,
  File,
  Download,
  QrCode,
  Copy,
  Trash2,
  Search,
  Check,
  HardDriveDownload,
  Layers,
} from 'lucide-react';
import { HubFile } from '@/lib/types';
import { formatFileSize, formatDate, copyToClipboard, playChime } from '@/lib/utils';
import { useToast } from './ToastContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface FileListProps {
  files: HubFile[];
  onSelectQrFile: (file: HubFile) => void;
  onFileDeleted: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onSelectQrFile, onFileDeleted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const getFileIcon = (mimeType: string, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-cyan-bright" />;
    }
    if (mimeType.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv'].includes(ext)) {
      return <Video className="w-5 h-5 text-violet-soft" />;
    }
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return <Music className="w-5 h-5 text-emerald-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-amber-400" />;
    }
    if (['ts', 'tsx', 'js', 'jsx', 'html', 'css', 'json', 'py', 'rs', 'go'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-rose-400" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    return <File className="w-5 h-5 text-slate-300" />;
  };

  const handleCopyLink = async (file: HubFile) => {
    const success = await copyToClipboard(file.public_url);
    if (success) {
      playChime('click');
      setCopiedId(file.id);
      showToast(`คัดลอกลิงก์ของ "${file.filename}" แล้ว`, 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      showToast('ไม่สามารถคัดลอกลิงก์ได้', 'error');
    }
  };

  const handleDelete = async (file: HubFile) => {
    setDeletingId(file.id);
    try {
      if (isSupabaseConfigured) {
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'hub-files';
        if (file.storage_path) {
          await supabase.storage.from(bucketName).remove([file.storage_path]);
        }
        await supabase.from('files').delete().eq('id', file.id);
      }
      playChime('click');
      onFileDeleted(file.id);
      showToast(`ลบไฟล์ "${file.filename}" ออกจากวงโคจรแล้ว`, 'info');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('เกิดข้อผิดพลาดในการลบไฟล์', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-glow/10 border border-violet-glow/20 text-violet-soft">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">ไฟล์ในวงโคจร (Orbital Files)</h4>
            <p className="text-xs text-slate-400">
              มี {files.length} รายการที่พร้อมดาวน์โหลดและส่งต่อ
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-space-900/60 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-neon/50 focus:ring-1 focus:ring-cyan-neon/30"
            />
          </div>
        )}
      </div>

      {/* Files Display */}
      {files.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-space-900/30">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <HardDriveDownload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-300">ยังไม่มีไฟล์ในวงโคจร</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            ลากและวางไฟล์ลงในช่องด้านบนเพื่ออัปโหลดและสร้าง QR Code สำหรับแชร์ได้ทันที
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          ไม่พบไฟล์ที่ตรงกับคำค้นหา <span className="text-cyan-bright">&ldquo;{searchTerm}&rdquo;</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AnimatePresence>
            {filteredFiles.map((file) => {
              const isCopied = copiedId === file.id;
              const isDeleting = deletingId === file.id;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="group relative flex flex-col justify-between p-4 rounded-2xl glass-panel hover:glass-panel-glow transition-all duration-300 border border-white/10 hover:border-cyan-neon/40 hover:-translate-y-1"
                >
                  {/* File Info */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-space-850/80 border border-white/10 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {getFileIcon(file.mime_type, file.filename)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5
                        className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-bright transition-colors"
                        title={file.filename}
                      >
                        {file.filename}
                      </h5>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300">{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-1.5">
                    {/* QR Code Action Button */}
                    <button
                      onClick={() => onSelectQrFile(file)}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-cyan-neon/10 hover:bg-cyan-neon/20 text-cyan-bright border border-cyan-neon/25 transition-all"
                      title="สร้างรหัส QR สแกนด่วน"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>สร้าง QR</span>
                    </button>

                    {/* Direct Download */}
                    <a
                      href={file.public_url}
                      download={file.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-colors"
                      title="ดาวน์โหลดไฟล์ตรง"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(file)}
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-colors"
                      title="คัดลอกลิงก์ส่งต่อ"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-cyan-bright" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors disabled:opacity-50"
                      title="ลบไฟล์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
