import React from "react";
import { readData } from "@/lib/db";
import LogTimeline, { LogEntry } from "@/components/ui/LogTimeline";

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

      {/* Vertical Timeline with Photo Documentation Lightbox */}
      <LogTimeline entries={logEntries} />
    </div>
  );
}
