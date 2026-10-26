'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  Radio,
  Smile,
  Edit2,
  Check,
} from 'lucide-react';
import { HubMessage } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { playChime } from '@/lib/utils';
import { useToast } from './ToastContext';

const DEFAULT_MESSAGES: HubMessage[] = [
  {
    id: 'msg-1',
    sender_name: 'ศูนย์ควบคุม Aether',
    content: 'ยินดีต้อนรับสู่ห้องสื่อสารควอนตัมประจำสถานี AetherHub 🛰️ สัญญาณไร้แรงโน้มถ่วงพร้อมใช้งาน',
    avatar_color: '#06B6D4',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const QUICK_EMOJIS = ['🚀', '🛰️', '🌌', '⚡', '🛸', '✨', '🪐'];
const AVATAR_COLORS = ['#06B6D4', '#8B5CF6', '#34D399', '#FBBF24', '#F43F5E', '#38BDF8'];

export const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState<HubMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('นักบินอวกาศ');
  const [userColor, setUserColor] = useState('#06B6D4');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('นักบินอวกาศ');
  const [isSending, setIsSending] = useState(false);
  // Reference directly to the scrollable chat container only
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    // Scroll ONLY the inner chat messages box, NEVER the entire browser window
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchLatestMessages = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(80);

      if (!error && data) {
        setMessages((prev) => {
          if (data.length === 0) return prev;
          const map = new Map<string, HubMessage>();
          prev.forEach((m) => map.set(m.id, m));
          (data as HubMessage[]).forEach((m) => map.set(m.id, m));
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
      }
    } catch (err) {
      console.warn('Sync messages polling error:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Initialize user identification
    try {
      const savedName = localStorage.getItem('aetherhub_username');
      if (savedName) {
        setUserName(savedName);
        setTempName(savedName);
      } else {
        const randomNum = Math.floor(100 + Math.random() * 900);
        const autoName = `นักบิน-${randomNum}`;
        setUserName(autoName);
        setTempName(autoName);
        localStorage.setItem('aetherhub_username', autoName);
      }

      const savedColor = localStorage.getItem('aetherhub_usercolor');
      if (savedColor) {
        setUserColor(savedColor);
      } else {
        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        setUserColor(randomColor);
        localStorage.setItem('aetherhub_usercolor', randomColor);
      }
    } catch {
      // Ignore
    }

    // 2. Fetch initial messages
    fetchLatestMessages();

    // 3. Supabase Realtime Channel: Listen to both Broadcast & Postgres Changes
    const channel = supabase.channel('hub-chat-sync', {
      config: { broadcast: { self: false } },
    });

    try {
      channel
        .on('broadcast', { event: 'new_message' }, (payload) => {
          const incoming = payload.payload as HubMessage;
          if (!incoming || !incoming.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            playChime('click');
            return [...prev, incoming];
          });
        })
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const incoming = payload.new as HubMessage;
            if (!incoming || !incoming.id) return;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              playChime('click');
              return [...prev, incoming];
            });
          }
        )
        .subscribe();
    } catch (cErr) {
      console.warn('Realtime chat subscription error:', cErr);
    }

    // 4. Polling Fallback: Refresh messages every 2.5 seconds
    const interval = setInterval(fetchLatestMessages, 2500);

    return () => {
      clearInterval(interval);
      try {
        supabase.removeChannel(channel);
      } catch {
        // Ignore
      }
    };
  }, [fetchLatestMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    setUserName(tempName.trim());
    setIsEditingName(false);
    try {
      localStorage.setItem('aetherhub_username', tempName.trim());
    } catch {
      // Ignore
    }
    showToast(`เปลี่ยนนามเรียกขานเป็น "${tempName.trim()}" แล้ว`, 'success');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempId = crypto.randomUUID();
    const newMsg: HubMessage = {
      id: tempId,
      sender_name: userName,
      content: messageText,
      avatar_color: userColor,
      created_at: new Date().toISOString(),
    };

    // 1. Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    playChime('upload');

    // 2. Broadcast immediately over WebSocket to other users
    try {
      const channel = supabase.channel('hub-chat-sync');
      channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch (bErr) {
      console.warn('Broadcast chat error:', bErr);
    }

    // 3. Persist to Supabase Database
    try {
      await supabase.from('messages').insert([
        {
          id: tempId,
          sender_name: userName,
          content: messageText,
          avatar_color: userColor,
        },
      ]);
    } catch (err) {
      console.warn('Message send exception:', err);
    }

    setIsSending(false);
  };

  const handleSendEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-7 border border-white/10 flex flex-col h-[560px] relative overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-neon/10 border border-cyan-neon/30 text-cyan-bright">
            <Radio className="w-5 h-5 animate-pulse text-cyan-neon" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span>ห้องสื่อสารควอนตัม (Quantum Live Chat)</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-neon" />
            </h3>
            <p className="text-xs text-slate-400">
              สัญญาณแชตสดแบบเรียลไทม์ระหว่างสมาชิกสถานี ส่งตรงทันทีทุกเครื่อง
            </p>
          </div>
        </div>

        {/* User Identity Pill */}
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={20}
                className="w-28 px-2 py-1 rounded-lg text-xs bg-space-900 border border-cyan-neon/40 text-cyan-bright focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                className="p-1 rounded-lg bg-cyan-neon/20 text-cyan-bright hover:bg-cyan-neon/30"
                title="บันทึกชื่อ"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors"
              title="คลิกเพื่อเปลี่ยนนามเรียกขาน"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: userColor }}
              />
              <span className="font-medium text-cyan-bright">{userName}</span>
              <Edit2 className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream Box: chatContainerRef controls inner scroll only */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3.5"
      >
        {messages.map((msg) => {
          const isMe = msg.sender_name === userName;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name & Timestamp */}
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: msg.avatar_color || '#06B6D4' }}
                />
                <span className={`font-semibold ${isMe ? 'text-cyan-bright' : 'text-slate-300'}`}>
                  {msg.sender_name}
                </span>
                <span>•</span>
                <span>{formatMessageTime(msg.created_at)}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-violet-glow/30 to-cyan-neon/25 border border-cyan-neon/40 text-slate-100 rounded-tr-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-space-900/90 border border-white/10 text-slate-200 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Emoji Reactions */}
      <div className="pt-2.5 pb-1 flex items-center space-x-1 overflow-x-auto">
        <span className="text-[11px] text-slate-500 mr-1 flex items-center">
          <Smile className="w-3 h-3 mr-1" /> ส่งด่วน:
        </span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendEmoji(emoji)}
            className="px-2 py-0.5 rounded-lg text-xs bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 transition-transform hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="pt-2 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความสื่อสารในสถานี (กด Enter เพื่อส่ง)..."
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-deep to-cyan-neon text-white font-medium text-xs sm:text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex-shrink-0"
        >
          <span>ส่ง</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
