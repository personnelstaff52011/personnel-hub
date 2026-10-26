'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Activity, ShieldCheck, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const LatencyBadge: React.FC = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [status, setStatus] = useState<'connected' | 'demo' | 'offline'>('connected');

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const measurePing = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline');
        setLatency(null);
        return;
      }

      if (!isSupabaseConfigured) {
        setStatus('demo');
        setLatency(12);
        return;
      }

      const start = performance.now();
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) throw new Error('No URL');
        // Ping Supabase public REST endpoint
        await fetch(`${url}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          cache: 'no-store',
        });
        const elapsed = Math.round(performance.now() - start);
        setLatency(elapsed);
        setStatus('connected');
      } catch {
        setLatency(Math.round(performance.now() - start) || 28);
        setStatus('demo');
      }
    };

    measurePing();
    const interval = setInterval(measurePing, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300 select-none bg-space-900/60 border-white/10 hover:border-cyan-neon/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      title={
        status === 'connected'
          ? 'เชื่อมต่อกับระบบคลาวด์ Supabase แบบเรียลไทม์'
          : status === 'demo'
          ? 'โหมดจำลองในเครื่อง (ใส่ค่าใน .env.local เพื่อเชื่อมต่อคลาวด์)'
          : 'เครือข่ายออฟไลน์'
      }
    >
      {/* Pulse Status Dot */}
      <div className="relative flex items-center justify-center">
        <span
          className={`h-2 w-2 rounded-full ${
            status === 'connected'
              ? 'bg-cyan-neon'
              : status === 'demo'
              ? 'bg-violet-soft'
              : 'bg-rose-500'
          }`}
        />
        <span
          className={`absolute h-3 w-3 rounded-full animate-ping opacity-75 ${
            status === 'connected'
              ? 'bg-cyan-neon'
              : status === 'demo'
              ? 'bg-violet-soft'
              : 'bg-rose-500'
          }`}
        />
      </div>

      <div className="flex items-center space-x-1.5 text-slate-300">
        {status === 'connected' && (
          <>
            <Database className="w-3.5 h-3.5 text-cyan-neon" />
            <span className="text-slate-200">เชื่อมต่อ Supabase</span>
            {latency !== null && (
              <span className="text-cyan-bright font-mono">{latency}ms</span>
            )}
          </>
        )}
        {status === 'demo' && (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-violet-soft" />
            <span className="text-violet-soft">โหมดจำลอง</span>
            <span className="text-slate-400 font-mono text-[11px]">(เครื่อง)</span>
          </>
        )}
        {status === 'offline' && (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-rose-400">ออฟไลน์</span>
          </>
        )}
      </div>
    </div>
  );
};
