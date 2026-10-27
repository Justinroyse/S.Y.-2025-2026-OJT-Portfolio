import React from "react";
import { readData } from "@/lib/db";

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

  let totalHours = 0;
  let totalTasks = 0;
  for (const entry of logEntries) {
    const match = entry.hours.match(/(\d+)/);
    if (match) {
      totalHours += parseInt(match[0], 10);
    }
    totalTasks += entry.tasks.length;
  }

  const targetHours = 300;
  const progressPercent = Math.min(
    100,
    Math.round((totalHours / targetHours) * 100)
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
            SECTION 04 // CHRONOLOGICAL RECORD
          </span>
          <h2 className="text-[20px] sm:text-[24px] font-bold font-orbitron tracking-[0.16em] text-white uppercase mt-1">
            Weekly Activity Log
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
          {logEntries.length} WEEKS RECORDED • {totalHours} / {targetHours} HRS
        </span>
      </div>

      {/* Telemetry Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="border border-white/15 bg-[#1b1c1e]/70 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
            CUMULATIVE HOURS
          </span>
          <span className="text-[18px] font-orbitron font-bold text-white">
            {totalHours} / {targetHours} HRS{" "}
            <span className="text-[12px] font-mono text-emerald-400 font-normal">
              ({progressPercent}%)
            </span>
          </span>
        </div>
        <div className="border border-white/15 bg-[#1b1c1e]/70 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
            WEEKS COMPLETED
          </span>
          <span className="text-[18px] font-orbitron font-bold text-white">
            {logEntries.length} WEEKS
          </span>
        </div>
        <div className="border border-white/15 bg-[#1b1c1e]/70 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">
            LOGGED ACCOMPLISHMENTS
          </span>
          <span className="text-[18px] font-orbitron font-bold text-white">
            {totalTasks} DELIVERABLES
          </span>
        </div>
      </div>

      {/* Vertical Timeline (Natural Page Flow - No Nested Scroll Trap) */}
      <div className="relative pl-4 sm:pl-6 border-l border-white/20 flex flex-col gap-6">
        {logEntries.map((entry, idx) => {
          const isApproved = entry.status.toUpperCase() === "APPROVED";
          return (
            <article
              key={entry.id || idx}
              className="relative border border-white/15 bg-[#1b1c1e]/65 p-5 sm:p-6 flex flex-col gap-4 hover:border-white/30 transition-colors"
            >
              {/* Timeline Node Marker */}
              <span
                aria-hidden="true"
                className="absolute -left-[21px] sm:-left-[29px] top-6 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#252525]"
              />

              {/* Top Row: Week, Dates, Hours, Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 border-b border-white/10 pb-3.5">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <h3 className="text-[15px] sm:text-[16px] font-orbitron font-bold text-white tracking-wider uppercase">
                    {entry.week}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono tracking-wider">
                    {entry.dates}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 text-[11px] text-neutral-200 font-mono">
                    {entry.hours}
                  </span>
                  <span
                    className={`px-2.5 py-1 border font-mono font-semibold tracking-wider text-[10px] uppercase ${
                      isApproved
                        ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                        : "border-amber-500/35 bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>

              {/* Tasks Bullet List in Readable Geist Sans */}
              <ul className="list-none flex flex-col gap-2.5 pl-0">
                {entry.tasks.map((task, taskIdx) => (
                  <li
                    key={taskIdx}
                    className="text-[14px] text-neutral-200 leading-relaxed flex items-start gap-3 font-sans max-w-[72ch]"
                  >
                    <span
                      aria-hidden="true"
                      className="text-emerald-400/80 font-mono text-xs pt-1 select-none shrink-0"
                    >
                      ▸
                    </span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
