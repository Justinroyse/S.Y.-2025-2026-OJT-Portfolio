"use client";

import React from "react";
import DropdownSelector from "../ui/DropdownSelector";
import NavBar from "../ui/NavBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#252525] text-white flex flex-col font-orbitron selection:bg-white selection:text-[#252525] tech-grid">
      
      {/* Desktop Grid Layout (lg and above) */}
      <div className="hidden lg:grid grid-cols-[100px_400px_1fr] grid-rows-[100px_minmax(400px,auto)_1fr] min-h-screen">
        
        {/* ROW 1 */}
        {/* Cell 1: Top-Left Corner Spacer */}
        <div className="border-r border-b border-white/15 bg-neutral-900/10" />
        
        {/* Cell 2: Academic & Navigation Selector (Rectangle 4) */}
        <div className="border-r border-b border-white/15 flex items-center justify-center bg-[#252525]/50 backdrop-blur-sm">
          <DropdownSelector />
        </div>
        
        {/* Cell 3: Top Header Area (NavBar) */}
        <div className="border-b border-white/15 flex items-center px-12 bg-[#252525]/50 backdrop-blur-sm">
          <NavBar />
        </div>

        {/* ROW 2 */}
        {/* Cell 4: Middle-Left Margin Spacer */}
        <div className="border-r border-b border-white/15 bg-neutral-900/10" />
        
        {/* Cell 5: Personal Info Sidebar */}
        <div className="border-r border-b border-white/15 flex flex-col justify-center px-12 gap-2.5 uppercase bg-[#252525]/30">
          <h1 className="text-[22px] font-normal leading-normal text-white tracking-wider">
            Justin Royse L. Solomon
          </h1>
          <p className="text-[15px] text-neutral-400 font-medium tracking-widest">
            BSCpE 2-6
          </p>
          <p className="text-[12px] text-neutral-500 font-mono tracking-widest mt-1">
            2024-02548-mn-0
          </p>
        </div>
        
        {/* Cell 6: Main Content Area */}
        <div className="border-b border-white/15 p-12 flex flex-col justify-center bg-[#252525]/10">
          <div className="w-full max-w-5xl mx-auto">
            {children}
          </div>
        </div>

        {/* ROW 3 */}
        {/* Cell 7: Bottom-Left Margin Spacer */}
        <div className="border-r border-white/15 bg-neutral-900/20" />
        
        {/* Cell 8: Bottom-Left Sidebar (Spacer) */}
        <div className="border-r border-white/15 bg-neutral-900/10" />
        
        {/* Cell 9: Footer Info */}
        <div className="p-12 flex justify-between items-center text-[11px] font-mono text-neutral-500 uppercase tracking-widest bg-[#252525]/40">
          <span>System Status: Online</span>
          <span>© 2026 Justin Royse L. Solomon | OJT PORTFOLIO</span>
        </div>

      </div>

      {/* Mobile/Tablet Layout (Under lg) */}
      <div className="flex lg:hidden flex-col flex-grow">
        {/* Top Header */}
        <header className="border-b border-white/15 bg-[#1e1e1e]/90 backdrop-blur-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-40">
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <DropdownSelector />
          </div>
          <NavBar />
        </header>

        {/* Profile Card Banner */}
        <section className="bg-neutral-900/40 border-b border-white/15 px-6 py-4">
          <div className="uppercase tracking-wider">
            <h2 className="text-[15px] font-bold text-white leading-tight">Justin Royse L. Solomon</h2>
            <div className="text-[11px] text-neutral-400 mt-1">BSCpE 2-6 | 2024-02548-mn-0</div>
          </div>
        </section>

        {/* Main content body */}
        <main className="flex-grow p-6 flex flex-col justify-center min-h-[300px]">
          <div className="w-full max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/15 bg-[#1e1e1e]/40 p-6 text-center text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
          © 2026 Justin Royse L. Solomon | OJT PORTFOLIO
        </footer>
      </div>

    </div>
  );
}
