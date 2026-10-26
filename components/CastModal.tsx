'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, Scan, Sparkles } from 'lucide-react';
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
  fgColor,
  bgColor,
  title = 'Orbital Hologram Beam',
}) => {
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useToast();

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
    const ok = await copyToClipboard(qrValue);
    if (ok) {
      setCopied(true);
      playChime('click');
      showToast('Payload link copied to clipboard', 'success');
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
          className="fixed inset-0 bg-space-950/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md rounded-3xl glass-panel-glow border-cyan-neon/30 p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_60px_rgba(6,182,212,0.25)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-colors"
            aria-label="Close Hologram"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hologram Header */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-neon/15 border border-cyan-neon/30 text-cyan-bright mb-3">
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            <span>Holographic Mobile Broadcast</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mb-6 flex items-center justify-center space-x-1">
            <Smartphone className="w-3.5 h-3.5 text-cyan-neon" />
            <span>Aim your mobile camera or lens to capture immediately</span>
          </p>

          {/* Hologram QR Container with Scanning Line */}
          <div className="relative p-6 rounded-2xl bg-space-900/90 border-2 border-cyan-neon/40 shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden">
            {/* Hologram Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-neon pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-neon pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-neon pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-neon pointer-events-none" />

            {/* Holographic Laser Scan Line */}
            <motion.div
              animate={{ y: [0, 240, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-electric to-transparent opacity-75 shadow-[0_0_15px_rgba(0,240,255,1)] pointer-events-none z-20"
            />

            {/* QR Render */}
            <div className="relative z-10 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
              <QRCodeSVG
                value={qrValue || 'https://aetherhub.vercel.app'}
                size={230}
                fgColor={fgColor}
                bgColor={bgColor === 'transparent' ? 'transparent' : bgColor}
                level="Q"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Value Preview & Copy */}
          <div className="mt-6 w-full flex items-center space-x-2 p-2 rounded-xl bg-space-950/70 border border-white/10 text-xs text-slate-300">
            <span className="truncate flex-1 font-mono text-left pl-2 text-cyan-bright">
              {qrValue}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-cyan-neon/20 hover:bg-cyan-neon/30 text-cyan-bright border border-cyan-neon/40 font-medium transition-colors flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
