import { Music, Sparkles, ShieldCheck, Heart, Radio, RefreshCw, Cpu, Layers } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-[var(--card-border)] text-[var(--text-muted)] animate-slide-up">
      <div className="bg-[var(--bg-card)]/80 border border-[var(--card-border)] rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md">
        {/* Brand & Mission Statement */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Music size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)] tracking-tight">
                MusicAI Platform
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Smart Personalized Music Streamer • Use comfortably on all devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--card-border)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
              v2.4 PWA Active
            </span>
          </div>
        </div>

        {/* Feature Summary Highlights */}
        <div className="py-5 border-b border-[var(--card-border)] space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <Layers size={14} className="text-[var(--accent-color)]" />
            <span>Platform Capabilities</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <Sparkles size={14} className="text-[var(--accent-color)] flex-shrink-0" />
              <span className="truncate">AI Recommendations</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <Radio size={14} className="text-purple-400 flex-shrink-0" />
              <span className="truncate">Live AI Assistant</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <Cpu size={14} className="text-blue-400 flex-shrink-0" />
              <span className="truncate">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">Offline Cache Backup</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <Music size={14} className="text-rose-400 flex-shrink-0" />
              <span className="truncate">Custom Playlists</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              <RefreshCw size={14} className="text-amber-400 flex-shrink-0" />
              <span className="truncate">30-Day Auto Session</span>
            </div>
          </div>
        </div>

        {/* 30-Day Session Notice & Background Updates */}
        <div className="py-4 border-b border-[var(--card-border)] space-y-2 text-xs">
          <div className="flex items-start gap-2 text-[var(--text-muted)]">
            <ShieldCheck size={15} className="text-[var(--accent-color)] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-[var(--text-primary)]">30-Day Persistent Login:</strong> Your session stays active securely for 30 days. Re-login is only required after 30 days of inactivity.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <RefreshCw size={14} className="text-emerald-400 flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Continuous Evolution:</strong> Exciting new features and playlist expansions are loading in the background.
            </p>
          </div>
        </div>

        {/* Bottom Credits & Developer Signature */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]"></span>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Architected & Developed by{' '}
              <span className="text-[var(--text-primary)] font-bold tracking-tight">Atrij Ghosh</span> • 2026
            </p>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">
            Release Date: August 2026 • All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
