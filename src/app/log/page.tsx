import React from "react";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

interface LogEntry {
  id: string;
  week: string;
  dates: string;
  hours: string;
  status: string;
  tasks: string[];
}

export default async function Log() {
  const logEntries = await readData<LogEntry[]>("logs.json");

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Page Title */}
      <div className="border-b border-white/10 pb-4 flex justify-between items-end">
        <h2 className="text-[20px] md:text-[24px] font-bold font-orbitron tracking-[0.2em] text-white uppercase">
          ACTIVITY_LOG
        </h2>
        <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
          TIMELINE VIEW
        </span>
      </div>

      {/* Timeline Scrollable Container */}
      <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
        {logEntries.map((entry, idx) => (
          <div 
            key={entry.id || idx} 
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
