import React from "react";

const logEntries = [
  {
    week: "WEEK 01",
    dates: "JUNE 01 - JUNE 05, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "HTE onboarding and development environment configuration.",
      "Repository setup and library dependency audits for the Next.js portfolio project.",
      "Participated in initial design syncs and Figma layout reviews."
    ]
  },
  {
    week: "WEEK 02",
    dates: "JUNE 08 - JUNE 12, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "Constructed reusable layout grids and structural routing wrappers.",
      "Implemented global typography loading for Orbitron and Geist Sans.",
      "Developed interactive page selector components matching design mockups."
    ]
  },
  {
    week: "WEEK 03",
    dates: "JUNE 15 - JUNE 19, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "Built interactive UI placeholder components and SVG graphics.",
      "Reviewed color palettes and adjusted custom Tailwind v4 configurations.",
      "Created technical responsive grids for list and detail items."
    ]
  },
  {
    week: "WEEK 04",
    dates: "JUNE 22 - JUNE 26, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "Migrated legacy contact details into biographical portfolios.",
      "Wrote structured specifications for OJT requirements checklist.",
      "Identified and debugged routing state errors in sidebar navigations."
    ]
  },
  {
    week: "WEEK 05",
    dates: "JUNE 29 - JULY 03, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "Configured automated build tests and resolved TypeScript warnings.",
      "Audited mobile navigation menus for responsive alignment.",
      "Prepared weekly report drafts and uploaded photo documentation."
    ]
  },
  {
    week: "WEEK 06",
    dates: "JULY 06 - JULY 10, 2026",
    hours: "40 HOURS",
    status: "APPROVED",
    tasks: [
      "Finalized stylesheet styling rules and scrollbar visual tweaks.",
      "Conducted complete design validation audits against Figma guidelines.",
      "Successfully built the production-ready Next.js artifact bundle."
    ]
  }
];

export default function Log() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Page Title */}
      <div className="border-b border-white/10 pb-4 flex justify-between items-end">
        <h2 className="text-[20px] md:text-[24px] font-bold font-orbitron tracking-[0.2em] text-white uppercase">
          ACTIVITY_LOG
        </h2>
        <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
          TOTAL: 240 HOURS
        </span>
      </div>

      {/* Timeline Scrollable Container */}
      <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
        {logEntries.map((entry, idx) => (
          <div 
            key={idx} 
            className="border border-white/10 bg-neutral-900/10 p-5 flex flex-col gap-3 font-orbitron hover:border-white/20 transition-colors duration-200"
          >
            {/* Top Row: Week, Dates, Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-white tracking-widest">
                  {entry.week}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                  [{entry.dates}]
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-neutral-400 font-mono">
                  {entry.hours}
                </span>
                <span className="px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest text-[9px]">
                  {entry.status}
                </span>
              </div>
            </div>

            {/* Tasks Bullet List */}
            <ul className="list-none flex flex-col gap-2 pl-0">
              {entry.tasks.map((task, taskIdx) => (
                <li 
                  key={taskIdx} 
                  className="text-[12px] text-neutral-400 leading-relaxed tracking-wide flex gap-2 normal-case font-sans"
                >
                  <span className="text-white/40 font-mono font-bold select-none">&gt;</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
    </div>
  );
}
