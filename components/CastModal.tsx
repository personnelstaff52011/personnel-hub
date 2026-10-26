'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, Scan, ExternalLink, Sun, Moon } from 'lucide-react';
import { copyToClipboard, playChime } from '@/lib/utils';
import { useToast } from './ToastContext';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  fgColor: string;
  bgColor: string;
  title?: string;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  qrValue,
  fgColor: initialFgColor,
  bgColor: initialBgColor,
  title = 'ฉายสัญญาณคิวอาร์ (Holographic Cast)',
}) => {
  const [copied, setCopied] = useState(false);
  const [isCleanWhite, setIsCleanWhite] = useState(true);
  const { showToast } = useToast();

  const cleanUrl = qrValue?.trim() || 'https://aetherhub.vercel.app';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(cleanUrl);
    if (ok) {
      setCopied(true);
      playChime('click');
      showToast('คัดลอกลิงก์สำเร็จแล้ว', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-space-950/85 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md rounded-3xl glass-panel-glow border-cyan-neon/30 p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(6,182,212,0.3)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hologram Header */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-neon/15 border border-cyan-neon/30 text-cyan-bright mb-3">
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            <span>โหมดสแกนผ่านกล้องโทรศัพท์มือถือ (100% Scan Ready)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mb-5 flex items-center justify-center space-x-1">
            <Smartphone className="w-3.5 h-3.5 text-cyan-neon" />
            <span>เปิดกล้องมือถือ (iOS / Android / LINE) ส่องเพื่อเปิดไฟล์ทันที</span>
          </p>

          {/* QR Display Card with Clean Quiet Zone Margin for 100% Scan Reliability */}
          <div className="relative p-5 rounded-2xl bg-white shadow-[0_0_35px_rgba(255,255,255,0.4)] overflow-hidden">
            <QRCodeSVG
              value={cleanUrl}
              size={240}
              fgColor={isCleanWhite ? '#000000' : initialFgColor || '#000000'}
              bgColor="#FFFFFF"
              level="M"
              includeMargin={true} // Guaranteed quiet zone for camera binarization
            />
          </div>

          {/* Theme switcher */}
          <div className="mt-4 flex items-center justify-center space-x-3 text-xs">
            <button
              onClick={() => setIsCleanWhite(!isCleanWhite)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10"
            >
              {isCleanWhite ? <Moon className="w-3 h-3 text-cyan-neon" /> : <Sun className="w-3 h-3 text-amber-400" />}
              <span>{isCleanWhite ? 'สลับเป็นสีคัสตอม' : 'สลับเป็นสีขาวดำ (สแกนง่ายสุด)'}</span>
            </button>

            {cleanUrl.startsWith('http') && (
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-neon/15 hover:bg-cyan-neon/25 text-cyan-bright border border-cyan-neon/30"
              >
                <span>เปิดลิงก์ในแท็บใหม่</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Preview & Copy */}
          <div className="mt-4 w-full flex items-center space-x-2 p-2 rounded-xl bg-space-950/70 border border-white/10 text-xs text-slate-300">
            <span className="truncate flex-1 font-mono text-left pl-2 text-cyan-bright">
              {cleanUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-cyan-neon/20 hover:bg-cyan-neon/30 text-cyan-bright border border-cyan-neon/40 font-medium transition-colors flex items-center space-x-1 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
