'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { playChime } from '@/lib/utils';
import { useToast } from './ToastContext';

type TimerMode = 'focus' | 'short' | 'long';

interface TimerPreset {
  label: string;
  duration: number;
  mode: TimerMode;
}

const PRESETS: TimerPreset[] = [
  { label: 'โฟกัสเข้มข้น', duration: 25 * 60, mode: 'focus' },
  { label: 'พักเบรกสั้น', duration: 5 * 60, mode: 'short' },
  { label: 'พักเบรกยาว', duration: 15 * 60, mode: 'long' },
];

export const FocusTimer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState<number>(PRESETS[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime('complete');
      showToast('🎉 ครบเวลาแล้ว! พักผ่อนและผ่อนคลายสักครู่ครับ', 'success');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, showToast]);

  const toggleRun = () => {
    playChime('click');
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playChime('click');
    setIsRunning(false);
    setTimeLeft(selectedPreset.duration);
  };

  const selectPreset = (preset: TimerPreset) => {
    playChime('click');
    setSelectedPreset(preset);
    setIsRunning(false);
    setTimeLeft(preset.duration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timeLeft / selectedPreset.duration;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-neon/10 border border-cyan-neon/20 text-cyan-bright">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white flex items-center space-x-1.5">
              <span>แกนเวลาและสมาธิ (Focus Core)</span>
            </h4>
            <p className="text-[11px] text-slate-400">นาฬิกาโฟกัสการทำงานสไตล์ Pomodoro</p>
          </div>
        </div>

        {/* Mode presets */}
        <div className="flex items-center space-x-1 bg-space-900/80 p-1 rounded-xl border border-white/10">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedPreset.label === p.label
                  ? 'bg-gradient-to-r from-violet-glow/30 to-cyan-neon/30 text-white border border-cyan-neon/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="relative flex items-center justify-center py-4">
        <div
          className={`absolute w-44 h-44 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
            isRunning ? 'bg-cyan-neon/20 opacity-100' : 'bg-violet-glow/10 opacity-40'
          }`}
        />

        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#neonGradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-linear"
          />
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Clock */}
        <motion.div
          animate={{
            y: isRunning ? [0, -4, 0] : 0,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute flex flex-col items-center justify-center text-center select-none"
        >
          <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {formattedTime}
          </span>
          <span className="text-[11px] font-medium text-cyan-bright mt-0.5 tracking-wider uppercase">
            {isRunning ? 'กำลังโฟกัส' : 'หยุดพัก'}
          </span>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center space-x-3">
        <button
          onClick={toggleRun}
          className={`flex-1 inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            isRunning
              ? 'bg-space-900 border border-white/20 text-slate-200 hover:bg-space-850'
              : 'bg-gradient-to-r from-violet-deep via-cyan-neon to-cyan-bright text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:opacity-90'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 text-cyan-bright" />
              <span>หยุดชั่วคราว</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>เริ่มการโฟกัส</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/10 transition-colors"
          title="รีเซ็ตเวลา"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
