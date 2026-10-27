'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Maximize2,
  Palette,
  Link2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Eye,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { CastModal } from './CastModal';
import { useToast } from './ToastContext';
import { copyToClipboard, playChime } from '@/lib/utils';

interface QrStudioProps {
  initialValue?: string;
}

const PRESET_COLORS = [
  { name: 'ดำคมชัด (สแกนง่ายสุด)', hex: '#000000', bg: '#FFFFFF' },
  { name: 'ฟ้าไซยานีออน', hex: '#06B6D4', bg: '#070913' },
  { name: 'ม่วงอิเล็กทริก', hex: '#8B5CF6', bg: '#070913' },
  { name: 'น้ำเงินเข้ม', hex: '#0F172A', bg: '#FFFFFF' },
  { name: 'เขียวมรกต', hex: '#059669', bg: '#FFFFFF' },
  { name: 'ส้มสุริยะ', hex: '#D97706', bg: '#FFFFFF' },
];

export const QrStudio: React.FC<QrStudioProps> = ({ initialValue = 'https://aetherhub.vercel.app' }) => {
  const [value, setValue] = useState(initialValue);
  // Default to black modules on white background for 100% camera scan compatibility
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isCastOpen, setIsCastOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highContrast, setHighContrast] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (initialValue) {
      setValue(initialValue.trim());
    }
  }, [initialValue]);

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value.trim());
    if (ok) {
      setCopied(true);
      playChime('click');
      showToast('คัดลอกข้อมูลเรียบร้อยแล้ว', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleHighContrast = () => {
    if (highContrast) {
      // Switch to Cyberpunk Neon
      setHighContrast(false);
      setFgColor('#06B6D4');
      setBgColor('#070913');
    } else {
      // Switch to High-contrast white (optimal for camera scanning)
      setHighContrast(true);
      setFgColor('#000000');
      setBgColor('#FFFFFF');
    }
    playChime('click');
  };

  const handleDownloadPng = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) throw new Error('ไม่พบข้อมูล SVG');

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const dimension = 1024;
      canvas.width = dimension;
      canvas.height = dimension;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = bgColor === 'transparent' ? '#FFFFFF' : bgColor;
        ctx.fillRect(0, 0, dimension, dimension);

        const padding = 60;
        ctx.drawImage(img, padding, padding, dimension - padding * 2, dimension - padding * 2);

        // Watermark text
        ctx.fillStyle = bgColor === '#FFFFFF' ? '#64748b' : '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ครอบครัว กำลังพล กองพลทหารช่าง', dimension / 2, dimension - 24);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `EngineerCorps-QR-${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        playChime('complete');
        showToast('ดาวน์โหลด QR Code ภาพคมชัดสูง (PNG) สำเร็จ', 'success');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Download error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกภาพ', 'error');
    }
  };

  const cleanQrValue = value?.trim() || 'https://aetherhub.vercel.app';

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 hover:border-violet-glow/30 transition-all duration-300">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06] mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-bright">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>สตูดิโอสร้างรหัสคิวอาร์ (QR Studio)</span>
              <Sparkles className="w-4 h-4 text-cyan-neon" />
            </h3>
            <p className="text-xs text-slate-400">
              สร้าง QR Code จากไฟล์หรือลิงก์ พร้อมโหมดคอนทราสต์สูงเพื่อให้กล้องมือถือสแกนติดทันที 100%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* High-Contrast Quick Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              highContrast
                ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                : 'bg-space-900 text-cyan-bright border-cyan-neon/40'
            }`}
            title="สลับโหมดสีขาวดำเพื่อให้กล้องมือถือสแกนง่ายที่สุด"
          >
            {highContrast ? <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> : <Moon className="w-3.5 h-3.5 text-cyan-neon" />}
            <span>{highContrast ? 'โหมดสแกนง่าย (ขาว-ดำ)' : 'โหมดสีนีออน'}</span>
          </button>

          <button
            onClick={() => setIsCastOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-glow/20 to-cyan-neon/20 hover:from-violet-glow/30 hover:to-cyan-neon/30 text-cyan-bright border border-cyan-neon/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ฉายขึ้นจอ (Cast)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Input text / URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-neon" />
                <span>ลิงก์ หรือ ข้อมูลเป้าหมาย (Target URL)</span>
              </label>

              {cleanQrValue && cleanQrValue.startsWith('http') && (
                <a
                  href={cleanQrValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-bright hover:underline flex items-center space-x-1"
                >
                  <span>ทดสอบเปิดลิงก์</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="กรอก URL, ข้อความ หรือคลิกปุ่ม 'สร้าง QR' จากรายการไฟล์ด้านบน..."
                className="w-full p-3.5 rounded-2xl glass-input text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none font-mono"
              />
              {value && (
                <button
                  onClick={handleCopy}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
                  title="คัดลอกลิงก์"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-cyan-bright" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-soft" />
              <span>ชุดสีและธีม (Color Theme)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setFgColor(c.hex);
                    setBgColor(c.bg);
                    setHighContrast(c.bg === '#FFFFFF');
                    playChime('click');
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    fgColor.toLowerCase() === c.hex.toLowerCase() && bgColor.toLowerCase() === c.bg.toLowerCase()
                      ? 'border-cyan-neon text-cyan-bright bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error correction */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                พื้นหลัง QR Code
              </label>
              <select
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  setHighContrast(e.target.value === '#FFFFFF');
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 cursor-pointer"
              >
                <option value="#FFFFFF" className="bg-space-900 text-white">สีขาวสะอาด (สแกนง่าย 100%)</option>
                <option value="#070913" className="bg-space-900">ห้วงอวกาศลึก (Deep Space)</option>
                <option value="#101626" className="bg-space-900">ออบซิเดียน (Obsidian)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                ระดับการกู้คืน (Error Correction)
              </label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 cursor-pointer"
              >
                <option value="M" className="bg-space-900">ปานกลาง (15% - แนะนำ)</option>
                <option value="Q" className="bg-space-900">คุณภาพสูง (25%)</option>
                <option value="H" className="bg-space-900">สูงสุด (30%)</option>
                <option value="L" className="bg-space-900">มาตรฐาน (7%)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadPng}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-deep to-cyan-neon text-white hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดภาพ PNG (ความละเอียดสูง)</span>
            </button>

            <button
              onClick={() => setIsCastOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-cyan-neon" />
              <span>ฉายโฮโลแกรมสแกน</span>
            </button>
          </div>
        </div>

        {/* Live Vector View Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative p-6 sm:p-7 rounded-3xl glass-panel-glow border-cyan-neon/30 flex flex-col items-center justify-center group shadow-[0_0_35px_rgba(6,182,212,0.15)]">
            {/* Background Pad: Always high contrast white card with quiet zone margin */}
            <div
              ref={qrRef}
              className="relative z-10 p-4 rounded-2xl shadow-xl transition-all duration-300"
              style={{ backgroundColor: bgColor === 'transparent' ? '#FFFFFF' : bgColor }}
            >
              <QRCodeSVG
                value={cleanQrValue}
                size={210}
                fgColor={fgColor}
                bgColor={bgColor === 'transparent' ? '#FFFFFF' : bgColor}
                level={errorLevel}
                includeMargin={true} // Crucial for 100% camera scanner detection
              />
            </div>

            <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-300">
              <Eye className="w-3.5 h-3.5 text-cyan-neon" />
              <span>มีขอบ Quiet Zone พร้อมให้กล้องมือถือสแกนได้ทันที</span>
            </div>
          </div>
        </div>
      </div>

      {/* Holographic Fullscreen Modal */}
      <CastModal
        isOpen={isCastOpen}
        onClose={() => setIsCastOpen(false)}
        qrValue={cleanQrValue}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  );
};
