'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Orbit, Sparkles, ArrowUpCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { HubFile } from '@/lib/types';
import { playChime } from '@/lib/utils';
import { useToast } from './ToastContext';

interface FileTransferZoneProps {
  onFileUploaded: (file: HubFile) => void;
}

export const FileTransferZone: React.FC<FileTransferZoneProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(15);
    setActiveFileName(file.name);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 15;
        });
      }, 100);

      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'hub-files';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

      let publicUrl = '';
      const storagePath = uniqueFileName;

      if (isSupabaseConfigured) {
        // Direct upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Storage upload error, attempting fallback URL:', uploadError);
          showToast(`Storage: ${uploadError.message}`, 'error');
          publicUrl = URL.createObjectURL(file);
        } else {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uniqueFileName);
          publicUrl = urlData.publicUrl;
        }

        // Insert metadata record into Supabase `files` table
        const { data: record, error: dbError } = await supabase
          .from('files')
          .insert([
            {
              filename: file.name,
              file_size: file.size,
              mime_type: file.type || 'application/octet-stream',
              public_url: publicUrl,
              storage_path: storagePath,
            },
          ])
          .select()
          .single();

        clearInterval(progressTimer);
        setUploadProgress(100);

        const savedFile: HubFile = (record as HubFile) || {
          id: crypto.randomUUID(),
          filename: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          public_url: publicUrl,
          storage_path: storagePath,
          created_at: new Date().toISOString(),
        };

        playChime('upload');
        showToast(`ดึงไฟล์ "${file.name}" เข้าสู่วงโคจรสำเร็จ!`, 'success');
        onFileUploaded(savedFile);
      } else {
        clearInterval(progressTimer);
        setUploadProgress(100);
        publicUrl = URL.createObjectURL(file);

        const localFile: HubFile = {
          id: crypto.randomUUID(),
          filename: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          public_url: publicUrl,
          storage_path: 'local-demo/' + uniqueFileName,
          created_at: new Date().toISOString(),
        };

        playChime('upload');
        showToast(`บันทึกในโหมดจำลอง: "${file.name}"`, 'info');
        onFileUploaded(localFile);
      }
    } catch (err: unknown) {
      console.error('Upload exception:', err);
      showToast(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setActiveFileName('');
      }, 700);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadFile(e.dataTransfer.files[0]);
      }
    },
    [isSupabaseConfigured]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative group">
      {/* Ambient Halo */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-glow/20 via-cyan-neon/30 to-violet-glow/20 blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-300" />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl cursor-pointer border transition-all duration-300 backdrop-blur-2xl overflow-hidden ${
          isDragging
            ? 'border-cyan-neon bg-cyan-950/30 shadow-[0_0_50px_rgba(6,182,212,0.4)] scale-[1.01]'
            : 'border-white/10 hover:border-violet-glow/50 bg-space-900/70 hover:bg-space-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {/* Singularity Core Rings */}
        <div className="relative mb-6 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isDragging ? [1, 1.25, 1.1] : [1, 1.1, 1],
              opacity: isDragging ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-violet-glow/30 via-cyan-neon/20 to-transparent blur-md pointer-events-none"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute w-28 h-28 rounded-full border border-dashed border-cyan-neon/40 pointer-events-none"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute w-20 h-20 rounded-full border border-violet-glow/40 pointer-events-none"
          />

          <div className="relative z-10 w-16 h-16 rounded-2xl bg-space-850/90 border border-white/15 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300">
            {uploading ? (
              <ArrowUpCircle className="w-8 h-8 text-cyan-bright animate-bounce" />
            ) : isDragging ? (
              <Orbit className="w-8 h-8 text-cyan-neon animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-slate-200 group-hover:text-cyan-bright transition-colors" />
            )}
          </div>
        </div>

        {/* Typography */}
        <div className="text-center z-10 max-w-md">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-cyan-bright mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>แกนดึงดูดสสาร (Gravitational Core)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            {uploading ? (
              <span className="text-glow-cyan text-cyan-bright">กำลังดึงข้อมูลเข้าสู่วงโคจร...</span>
            ) : isDragging ? (
              <span className="text-cyan-neon">ปล่อยไฟล์เพื่อส่งเข้าสู่ระบบ</span>
            ) : (
              <>ลากและวางไฟล์ที่นี่ หรือ <span className="text-cyan-bright hover:underline">คลิกเพื่อเลือกไฟล์</span></>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-slate-400">
            อัปโหลดขึ้น Supabase Storage พร้อมส่งสัญญาณเรียลไทม์ และสร้าง QR Code ให้ผู้ใช้อื่นสแกนได้ทันที
          </p>
        </div>

        {/* Upload Progress Bar */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 w-full max-w-sm z-10"
            >
              <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-1.5">
                <span className="truncate max-w-[200px] text-cyan-bright">{activeFileName}</span>
                <span className="font-mono text-cyan-neon">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-space-800 border border-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-glow via-cyan-neon to-cyan-bright rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footnote */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center space-x-4 text-[11px] text-slate-400">
          <span>ขนาดสูงสุด: 50MB</span>
          <span>•</span>
          <span>ซิงค์เรียลไทม์ทุกหน้าจอ</span>
          <span>•</span>
          <span>สแกนกล้องมือถือติดทันที</span>
        </div>
      </div>
    </div>
  );
};
