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
} from 'lucide-react';
import { CastModal } from './CastModal';
import { useToast } from './ToastContext';
import { copyToClipboard, playChime } from '@/lib/utils';

interface QrStudioProps {
  initialValue?: string;
}

const PRESET_COLORS = [
  { name: 'ฟ้าไซยานีออน', hex: '#06B6D4' },
  { name: 'ม่วงอิเล็กทริก', hex: '#A78BFA' },
  { name: 'ขาวบริสุทธิ์', hex: '#FFFFFF' },
  { name: 'เขียวมรกต', hex: '#34D399' },
  { name: 'ส้มสุริยะ', hex: '#FBBF24' },
  { name: 'ชมพูนีออน', hex: '#F43F5E' },
];

export const QrStudio: React.FC<QrStudioProps> = ({ initialValue = 'https://aetherhub.vercel.app' }) => {
  const [value, setValue] = useState(initialValue);
  const [fgColor, setFgColor] = useState('#06B6D4');
  const [bgColor, setBgColor] = useState('transparent');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [isCastOpen, setIsCastOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      playChime('click');
      showToast('คัดลอกข้อมูลเรียบร้อยแล้ว', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
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
        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, dimension, dimension);
        } else {
          ctx.fillStyle = '#070913';
          ctx.fillRect(0, 0, dimension, dimension);
        }

        const padding = 80;
        ctx.drawImage(img, padding, padding, dimension - padding * 2, dimension - padding * 2);

        ctx.fillStyle = '#64748b';
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('สร้างโดย AetherHub (Anti-Gravity QR)', dimension / 2, dimension - 30);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `AetherHub-QR-${Date.now()}.png`;
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

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 hover:border-violet-glow/30 transition-all duration-300">
      {/* Studio Header */}
      <div className="flex items-center justify-between pb-5 border-b border-white/[0.06] mb-6">
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
              สร้างรหัส QR แบบเวกเตอร์โฮโลแกรมเรียลไทม์ สำหรับลิงก์ ไฟล์ หรือข้อความใดๆ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCastOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-glow/20 to-cyan-neon/20 hover:from-violet-glow/30 hover:to-cyan-neon/30 text-cyan-bright border border-cyan-neon/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>ฉายขึ้นจอ (Cast)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-neon" />
              <span>ลิงก์ หรือ ข้อความที่ต้องการแปลงเป็น QR Code</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="กรอก URL, ข้อความ, เบอร์โทร, หรือเลือกไฟล์จากด้านบน..."
                className="w-full p-3.5 rounded-2xl glass-input text-sm text-slate-100 placeholder-slate-500 resize-none font-mono"
              />
              {value && (
                <button
                  onClick={handleCopy}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
                  title="คัดลอกข้อความ"
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
              <span>เฉดสีเส้นรหัส (Photon Hue)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setFgColor(c.hex);
                    playChime('click');
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    fgColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-white text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                      : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background & Quality */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                พื้นหลัง QR Code
              </label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 cursor-pointer"
              >
                <option value="transparent" className="bg-space-900">กระจกโปร่งใส (Transparent)</option>
                <option value="#070913" className="bg-space-900">ห้วงอวกาศลึก (Deep Space)</option>
                <option value="#101626" className="bg-space-900">ออบซิเดียน (Obsidian)</option>
                <option value="#FFFFFF" className="bg-space-900 text-black">ขาวสว่าง (Solid White)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                ระดับการแก้ไขข้อผิดพลาด (Fault Tolerance)
              </label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 cursor-pointer"
              >
                <option value="L" className="bg-space-900">ต่ำ (กู้คืน 7%)</option>
                <option value="M" className="bg-space-900">ปานกลาง (กู้คืน 15%)</option>
                <option value="Q" className="bg-space-900">คุณภาพสูง (กู้คืน 25%)</option>
                <option value="H" className="bg-space-900">สูงสุด (กู้คืน 30%)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
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

        {/* Live Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative p-6 sm:p-8 rounded-3xl glass-panel-glow border-cyan-neon/30 flex flex-col items-center justify-center group">
            <div
              className="absolute inset-4 rounded-full blur-2xl opacity-40 pointer-events-none transition-all duration-500"
              style={{ backgroundColor: fgColor }}
            />

            <div ref={qrRef} className="relative z-10 p-3 rounded-2xl bg-space-950/70 border border-white/10">
              <QRCodeSVG
                value={value || 'https://aetherhub.vercel.app'}
                size={200}
                fgColor={fgColor}
                bgColor={bgColor === 'transparent' ? 'transparent' : bgColor}
                level={errorLevel}
                includeMargin={false}
              />
            </div>

            <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400">
              <Eye className="w-3.5 h-3.5 text-cyan-neon" />
              <span>แสดงผลลัพธ์แบบเรียลไทม์</span>
            </div>
          </div>
        </div>
      </div>

      <CastModal
        isOpen={isCastOpen}
        onClose={() => setIsCastOpen(false)}
        qrValue={value}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  );
};
