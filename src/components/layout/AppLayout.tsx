"use client";

import React from "react";
import NavBar from "../ui/NavBar";

export interface ProfileSummary {
  name: string;
  course: string;
  studentId: string;
  avatarUrl?: string;
  totalHours: number;
  targetHours: number;
  submittedDocs: number;
  totalDocs: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  profile?: ProfileSummary;
}

const DEFAULT_PROFILE: ProfileSummary = {
  name: "Justin Royse L. Solomon",
  course: "BSCpE 2-6",
  studentId: "2024-02548-mn-0",
  avatarUrl: "",
  totalHours: 240,
  targetHours: 300,
  submittedDocs: 1,
  totalDocs: 17,
};

export default function AppLayout({
  children,
  profile = DEFAULT_PROFILE,
}: AppLayoutProps) {
  const hoursPercent = Math.min(
    100,
    Math.round((profile.totalHours / Math.max(1, profile.targetHours)) * 100)
  );

  // Compute initials fallback for avatar frame
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen w-full bg-[#252525] text-[#f4f4f6] selection:bg-white selection:text-[#252525] tech-grid">
      {/* Single Unified Responsive Blueprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[56px_310px_1fr] xl:grid-cols-[80px_350px_1fr] lg:grid-rows-[76px_1fr_auto] min-h-screen">
        {/* ROW 1, CELL 1: Top-Left Coordinate Rail (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden lg:flex items-center justify-center border-r border-b border-white/15 bg-[#1b1c1e]/40 text-[10px] font-mono text-neutral-600 select-none"
        >
          00
        </div>

        {/* ROW 1, CELL 2: Portfolio Header Block (Desktop) / Identity Header (Mobile) */}
        <div className="border-b lg:border-r border-white/15 bg-[#1b1c1e]/85 lg:bg-[#252525]/60 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-6 flex items-center justify-center">
          {/* Mobile/Tablet Identity Header with Centered Profile Thumbnail */}
          <div className="flex flex-col items-center text-center gap-2 lg:hidden min-w-0">
            <div className="w-16 h-16 border border-white/25 bg-[#121314] flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <span className="text-[13px] font-orbitron font-bold text-neutral-400">
                  {initials || "JS"}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 tracking-[0.16em] uppercase">
                COMPUTER ENGINEERING STUDENT
              </span>
              <span className="text-[13px] sm:text-[14px] font-orbitron font-bold tracking-wider text-white uppercase truncate mt-0.5">
                {profile.name}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 tracking-wider truncate mt-0.5">
                {profile.course} • {profile.studentId}
              </span>
            </div>
          </div>

          {/* Desktop Academic Term Identifier */}
          <div className="hidden lg:flex flex-col items-center text-center gap-0.5 select-none">
            <span className="text-[11px] font-orbitron font-bold tracking-[0.2em] text-white uppercase">
              OJT 1 PORTFOLIO
            </span>
            <span className="text-[10px] font-mono text-neutral-400 tracking-[0.18em] uppercase">
              S.Y. 2025 – 2026
            </span>
          </div>
        </div>

        {/* ROW 1, CELL 3: Primary Navigation Header (Sticky on Mobile/Tablet) */}
        <header className="sticky top-0 z-30 lg:static border-b border-white/15 bg-[#1b1c1e]/95 lg:bg-[#252525]/60 backdrop-blur-md px-4 sm:px-8 lg:px-10 xl:px-12 flex items-center min-h-[52px] lg:min-h-0">
          <NavBar />
        </header>

        {/* ROW 2, CELL 4: Middle-Left Blueprint Margin Rail (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden lg:flex flex-col justify-between items-center py-8 border-r border-b border-white/15 bg-[#1b1c1e]/25 text-[9px] font-mono text-neutral-600 select-none"
        >
          <span>01</span>
          <span className="[writing-mode:vertical-rl] rotate-180 tracking-[0.3em] uppercase text-neutral-600">
            PUP // OJT-1 PORTFOLIO
          </span>
          <span>02</span>
        </div>

        {/* ROW 2, CELL 5: Engineering Title Block & Live Telemetry Sidebar */}
        <aside className="border-b lg:border-r border-white/15 bg-[#1b1c1e]/35 lg:bg-[#252525]/35 px-4 py-3.5 sm:px-8 sm:py-4 lg:p-8 xl:p-10 flex flex-col justify-between">
          {/* Desktop Full Title Block + Sticky Anchor */}
          <div className="lg:sticky lg:top-8 flex flex-col gap-6">
            {/* Desktop Identity Header + Centered Framed Profile Portrait */}
            <div className="hidden lg:flex flex-col items-center text-center gap-4">
              {/* Centered Profile Portrait Frame */}
              <div className="relative w-32 h-32 xl:w-36 xl:h-36 mx-auto border border-white/30 bg-[#1b1c1e] flex items-center justify-center overflow-hidden select-none">
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/70 pointer-events-none z-10" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/70 pointer-events-none z-10" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/70 pointer-events-none z-10" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/70 pointer-events-none z-10" />

                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name} Profile Portrait`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[20px] font-orbitron font-bold text-white/80 tracking-widest">
                      {initials || "JS"}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-500 tracking-widest uppercase mt-0.5">
                      ID_PORTRAIT
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 tracking-[0.16em] uppercase">
                  COMPUTER ENGINEERING STUDENT
                </span>
                <h1 className="text-[19px] xl:text-[21px] font-orbitron font-bold leading-snug text-white tracking-wider uppercase">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-white/8 border border-white/15 text-[11px] font-orbitron font-semibold text-neutral-200 tracking-widest uppercase">
                    {profile.course}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 tracking-wider uppercase">
                    {profile.studentId}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Telemetry Strip (Visible on Mobile/Tablet & Desktop Sidebar) */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 lg:pt-6 lg:border-t lg:border-white/10">
              {/* Hours Progress Readout */}
              <div className="bg-[#1b1c1e]/70 border border-white/10 p-3 lg:p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">
                    HOURS LOGGED
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {hoursPercent}%
                  </span>
                </div>
                <div className="text-[13px] sm:text-[14px] font-orbitron font-bold text-white tracking-wider">
                  {profile.totalHours}{" "}
                  <span className="text-neutral-500 font-normal text-[11px]">
                    / {profile.targetHours} HRS
                  </span>
                </div>
                <div
                  className="w-full h-1.5 bg-white/10 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={profile.totalHours}
                  aria-valuemin={0}
                  aria-valuemax={profile.targetHours}
                  aria-label="OJT Hours Progress"
                >
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${hoursPercent}%` }}
                  />
                </div>
              </div>

              {/* Deliverables Status Readout */}
              <div className="bg-[#1b1c1e]/70 border border-white/10 p-3 lg:p-4 flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">
                    DELIVERABLES
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-emerald-400 inline-block" />
                    ACTIVE
                  </span>
                </div>
                <div className="text-[13px] sm:text-[14px] font-orbitron font-bold text-white tracking-wider">
                  {profile.submittedDocs}{" "}
                  <span className="text-neutral-500 font-normal text-[11px]">
                    / {profile.totalDocs} FILED
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 truncate">
                  SY 2025–2026 • OJT 1
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Academic Meta Stamp */}
          <div className="hidden lg:flex flex-col items-center text-center gap-1 pt-8 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            <span>Polytechnic University of the Philippines</span>
            <span className="text-neutral-600">College of Engineering • CpE</span>
          </div>
        </aside>

        {/* ROW 2, CELL 6: Main Content Viewport (Rendered Once) */}
        <main className="border-b border-white/15 px-4 py-6 sm:px-8 sm:py-8 lg:p-10 xl:p-12 flex flex-col justify-start bg-[#252525]/15 min-w-0">
          <div className="w-full max-w-5xl mx-auto">{children}</div>
        </main>

        {/* ROW 3, CELL 7: Bottom-Left Rail Corner (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden lg:block border-r border-white/15 bg-[#1b1c1e]/40"
        />

        {/* ROW 3, CELL 8: Bottom Sidebar Status Cell (Desktop) */}
        <div className="hidden lg:flex items-center justify-between px-8 xl:px-10 py-5 border-r border-white/15 bg-[#1b1c1e]/25 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          <span>DOC_REV: 2026.10</span>
          <span className="text-emerald-400/90">● VERIFIED</span>
        </div>

        {/* ROW 3, CELL 9: Main Footer */}
        <footer className="px-4 py-5 sm:px-8 lg:px-10 xl:px-12 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase tracking-widest bg-[#1b1c1e]/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 inline-block" />
            <span>SYSTEM STATUS: ONLINE</span>
          </div>
          <span className="text-center sm:text-right text-neutral-500">
            © 2026 {profile.name} | OJT PORTFOLIO
          </span>
        </footer>
      </div>
    </div>
  );
}
