# 🌌 AetherHub - Anti-Gravity Working Hub

A production-ready, ultra-responsive Web Application engineered for zero-gravity file ingestion, real-time holographic QR vector generation, and ambient focus productivity micro-tools. Fully integrated with **Supabase (Database & Storage)** and optimized for instantaneous deployment on **Vercel**.

---

## ⚡ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router, TypeScript, Server & Client Components)
- **Styling**: Tailwind CSS, Custom Neon Space Design Tokens & Glassmorphism
- **Iconography**: Lucide React
- **Motion & Gravity**: Framer Motion (floating levitation keyframes, responsive physics, ambient nebula glows)
- **Database & Storage**: Supabase (`@supabase/supabase-js`, PostgreSQL with RLS, public storage bucket `hub-files`)
- **Vector QR Engine**: `qrcode.react` (SVG / Canvas HD rendering, live reactive color matrices)
- **Audio Synthesizer**: Web Audio API (cosmic chimes, zero external asset dependencies)
- **Deployment Target**: Vercel (Edge-ready, serverless, automated CI/CD)

---

## 🛸 Key Features

### 1. Gravitational Singularity Core (File Transfer & Storage)
- Interactive Drag-and-Drop Dropzone styled as an orbital accretion disk.
- Direct-to-bucket uploading to Supabase Storage (`hub-files`).
- Automatic synchronization with the `files` PostgreSQL table (`id`, `filename`, `file_size`, `mime_type`, `public_url`, `created_at`).
- Smooth animated progress feedback with glowing orbital rings.
- Dynamic file card grid with:
  - Formatted file sizes (KB/MB) and MIME type badges.
  - Direct download links.
  - One-click **"QR Code"** trigger to beam file payload into mobile devices.
  - Quick-copy link buttons with tactile toasts.
  - Remote purge capability.

### 2. Holographic QR Code Studio
- Real-time responsive QR code generator for URLs, arbitrary payloads, or auto-selected uploaded files.
- Vector styling: Neon Cyan, Electric Violet, Emerald Flux, Solar Amber, Pure White, or custom hues.
- Transparent glass or dark void background selector.
- Adjustable error correction (L, M, Q, H).
- **Download as Ultra HD PNG** (1024x1024 canvas renderer).
- **"Cast to Screen" Modal**: Fullscreen holographic scanner view with laser scan lines designed for mobile camera scanning across the room.

### 3. Ambient Space Micro-Tools
- **Quick Scratchpad**: Markdown memo notepad with character/word counter, instant copy, markdown export (`.md`), and real-time syncing across LocalStorage and Supabase.
- **Zero-Gravity Focus Core**: Pomodoro timer (25m Focus, 5m Nebula Break, 15m Long Stasis) with circular neon progress ring and cosmic audio completion alerts.
- **Latency & Ping Telemetry**: Live heartbeat monitor tracking Supabase REST endpoint response times and network status.
- **Floating Command Dock**: Bottom-dock navigation bar with layout transitions and shortcut filters.

---

## 🗄️ Supabase Setup & SQL Migration

1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to **SQL Editor** -> **New Query**.
2. Open and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.
3. This creates:
   - The `hub-files` public storage bucket.
   - The `files` and `notes` PostgreSQL tables.
   - Full Row Level Security (RLS) policies allowing public read and insert operations.

---

## 🚀 Environment Variables

Create `.env.local` based on [`.env.example`](./.env.example):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=hub-files
```

*Note: If no Supabase credentials are provided, AetherHub automatically switches into Local Demo Mode so all features, file drops, QR generation, and timers remain functional.*

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to enter the Hub.

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your repository to GitHub or GitLab.
2. Import the project in Vercel.
3. Add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
4. Deploy!
