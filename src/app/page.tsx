import Link from "next/link";
import { readData } from "@/lib/db";
import CrossedBox from "@/components/ui/CrossedBox";

interface AboutData {
  name: string;
  course: string;
  studentId: string;
  objective: string;
}

interface LogEntry {
  id: string;
  week: string;
  dates: string;
  hours: string;
  status: string;
  tasks: string[];
}

interface HTEData {
  name: string;
  designation: string;
  details: string;
  logoUrl: string;
}

interface RequirementItem {
  key: string;
  name: string;
  href: string;
}

export default async function Home() {
  const [aboutData, logs, hteData, requirements] = await Promise.all([
    readData<AboutData>("about.json"),
    readData<LogEntry[]>("logs.json"),
    readData<HTEData>("hte.json"),
    readData<RequirementItem[]>("requirements.json"),
  ]);

  let totalHours = 0;
  for (const log of logs) {
    const match = log.hours.match(/(\d+)/);
    if (match) {
      totalHours += parseInt(match[0], 10);
    }
  }

  const targetHours = 300;
  const remainingHours = Math.max(0, targetHours - totalHours);
  const progressPercent = Math.min(
    100,
    Math.round((totalHours / targetHours) * 100)
  );
  const submittedCount = requirements.filter(
    (r) => Boolean(r.href && r.href !== "#")
  ).length;
  const latestLog = logs[logs.length - 1];

  const ojtStats = [
    {
      label: "HOST ESTABLISHMENT",
      value: hteData.name,
      sub: "Partner Organization",
    },
    {
      label: "DESIGNATION",
      value: hteData.designation,
      sub: "Assigned Division",
    },
    {
      label: "HOURS LOGGED",
      value: `${totalHours} / ${targetHours} HRS`,
      sub: `${remainingHours} hours remaining`,
    },
    {
      label: "DELIVERABLES",
      value: `${submittedCount} / ${requirements.length} FILED`,
      sub: `${aboutData.course} • OJT 1`,
    },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-12 w-full">
      {/* Hero Dossier Header */}
      <section className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-8 lg:gap-12 w-full">
        {/* Left Dossier Narrative */}
        <div className="flex-1 flex flex-col gap-5 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 self-start px-2.5 py-1 border border-white/15 bg-[#1b1c1e]">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span className="text-[10px] font-mono text-neutral-300 tracking-[0.2em] uppercase">
              OJT 1 COURSE SUBJECT • SY 2025–2026
            </span>
          </div>

          <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-orbitron font-bold leading-snug text-white tracking-wide uppercase">
            Engineering Internship Dossier &amp; Deliverable Archive
          </h2>

          <p className="text-[14px] sm:text-[15px] text-neutral-300 leading-relaxed max-w-[65ch]">
            Documenting my field training experience, weekly engineering
            accomplishments, and formal compliance records at{" "}
            <strong className="text-white font-semibold">{hteData.name}</strong>{" "}
            as a{" "}
            <span className="text-neutral-200 underline decoration-white/30 underline-offset-4">
              {hteData.designation}
            </span>
            .
          </p>

          {hteData.details ? (
            <div className="border-l-2 border-white/25 pl-4 py-1">
              <p className="text-[13px] sm:text-[14px] text-neutral-400 leading-relaxed max-w-[62ch]">
                {hteData.details}
              </p>
            </div>
          ) : null}

          {/* Primary Navigation Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/requirements"
              className="min-h-[44px] px-5 py-2.5 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-[11px] sm:text-[12px] tracking-widest uppercase inline-flex items-center justify-center transition-colors"
            >
              Inspect Deliverables ({submittedCount}/{requirements.length})
            </Link>
            <Link
              href="/log"
              className="min-h-[44px] px-5 py-2.5 border border-white/20 bg-[#1b1c1e]/80 hover:border-white/45 hover:bg-white/5 text-white font-orbitron font-semibold text-[11px] sm:text-[12px] tracking-widest uppercase inline-flex items-center justify-center transition-colors"
            >
              View Weekly Logs ({logs.length} Weeks)
            </Link>
          </div>
        </div>

        {/* Right HTE Seal Frame */}
        <div className="self-center md:self-auto flex flex-col items-center gap-2">
          <CrossedBox
            logoUrl={hteData.logoUrl}
            establishmentName={hteData.name}
          />
          <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            HOST TRAINING ESTABLISHMENT
          </span>
        </div>
      </section>

      {/* 300-Hour Progress Telemetry Bar */}
      <section className="border border-white/15 bg-[#1b1c1e]/75 p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
              INTERNSHIP RENDERED HOURS TELEMETRY
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-[22px] sm:text-[26px] font-orbitron font-bold text-white tracking-wider">
                {totalHours}
              </span>
              <span className="text-[13px] font-mono text-neutral-400 uppercase">
                / {targetHours} REQUIRED HOURS ({progressPercent}%)
              </span>
            </div>
          </div>

          {latestLog ? (
            <div className="text-[11px] font-mono text-neutral-400">
              Latest Entry:{" "}
              <span className="text-white font-semibold">{latestLog.week}</span>{" "}
              <span className="text-neutral-500">[{latestLog.dates}]</span>
            </div>
          ) : null}
        </div>

        <div
          className="w-full h-2.5 bg-white/8 border border-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={totalHours}
          aria-valuemin={0}
          aria-valuemax={targetHours}
          aria-label="Total OJT Hours Completed"
        >
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* 4-Column Specification Readout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
        {ojtStats.map((stat) => (
          <div
            key={stat.label}
            className="border border-white/15 bg-[#1b1c1e]/50 p-4 sm:p-5 flex flex-col justify-between gap-2"
          >
            <span className="text-[10px] text-neutral-400 tracking-[0.18em] uppercase font-mono">
              {stat.label}
            </span>
            <span className="text-[14px] sm:text-[15px] text-white font-orbitron font-bold tracking-wider uppercase break-words">
              {stat.value}
            </span>
            <span className="text-[11px] text-neutral-500 font-sans">
              {stat.sub}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
