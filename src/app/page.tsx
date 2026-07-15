import { readData } from "@/lib/db";
import CrossedBox from "@/components/ui/CrossedBox";

export const dynamic = "force-dynamic";

interface AboutData {
  name: string;
  course: string;
  studentId: string;
}

interface LogEntry {
  hours: string;
}

interface HTEData {
  name: string;
  designation: string;
  logoUrl: string;
}

export default async function Home() {
  const aboutData = await readData<AboutData>("about.json");
  const logs = await readData<LogEntry[]>("logs.json");
  const hteData = await readData<HTEData>("hte.json");

  // Sum up hours from the log entries dynamically
  let totalHours = 0;
  logs.forEach((log) => {
    const match = log.hours.match(/(\d+)/);
    if (match) {
      totalHours += parseInt(match[0], 10);
    }
  });

  const ojtStats = [
    { label: "ESTABLISHMENT", value: hteData.name },
    { label: "DESIGNATION", value: hteData.designation },
    { label: "HOURS LOGGED", value: `${totalHours} / 240 HOURS` },
    { label: "TERM", value: `${aboutData.course}` },
  ];

  return (
    <div className="flex flex-col gap-16 w-full animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
        {/* Left Intro Text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <p className="text-[16px] md:text-[20px] font-normal leading-relaxed text-white font-orbitron tracking-wide uppercase">
            OJT PORTFOLIO DOCUMENTING MY EXPERIENCES, JOURNEY AND DELIVERABLES FOR{" "}
            <span className="underline decoration-white/60 underline-offset-8 decoration-1 font-bold">
              OJT 1 COURSE SUBJECT
            </span>
          </p>
        </div>

        {/* Right Crossed Box Logo Placeholder */}
        <div className="flex-shrink-0 flex justify-center">
          <CrossedBox logoUrl={hteData.logoUrl} />
        </div>
      </div>

      {/* Technical Dashboard Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
        {ojtStats.map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-1.5 font-orbitron">
            <span className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase font-mono">
              {stat.label}
            </span>
            <span className="text-[13px] md:text-[14px] text-white font-bold tracking-wider uppercase">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
