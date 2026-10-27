import Link from "next/link";
import { readData } from "@/lib/db";

interface ContactItem {
  label: string;
  value: string;
  href: string;
}

interface AboutData {
  name: string;
  course: string;
  studentId: string;
  avatarUrl?: string;
  biography: string;
  objective: string;
  contactInfo: ContactItem[];
  skillSet: string[];
}

interface HTEData {
  name: string;
  designation: string;
  details: string;
}

export default async function About() {
  const [data, hteData] = await Promise.all([
    readData<AboutData>("about.json"),
    readData<HTEData>("hte.json"),
  ]);

  const initials = data.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex flex-col gap-8 sm:gap-10 w-full">
      {/* Page Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
            SECTION 02 // STUDENT PROFILE
          </span>
          <h2 className="text-[20px] sm:text-[24px] font-bold font-orbitron tracking-[0.16em] text-white uppercase mt-1">
            Trainee Profile &amp; Objectives
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
          {data.course} • ID: {data.studentId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Portrait + Biography, Objectives, HTE Assignment (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Student Identity & Engineering Biography */}
          <section className="border border-white/15 bg-[#1b1c1e]/60 p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-white/10 pb-4">
              <div className="relative w-20 h-20 border border-white/30 bg-[#121314] flex items-center justify-center overflow-hidden shrink-0 select-none">
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/70 pointer-events-none z-10" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/70 pointer-events-none z-10" />
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/70 pointer-events-none z-10" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/70 pointer-events-none z-10" />

                {data.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.avatarUrl}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[16px] font-orbitron font-bold text-white/80 tracking-widest">
                    {initials || "JS"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-emerald-400 tracking-[0.18em] uppercase">
                  COMPUTER ENGINEERING STUDENT
                </span>
                <h3 className="text-[16px] sm:text-[18px] font-orbitron font-bold text-white tracking-wider uppercase">
                  {data.name}
                </h3>
                <span className="text-[11px] font-mono text-neutral-400 tracking-wider uppercase">
                  {data.course} • {data.studentId}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-[11px] font-orbitron font-bold text-neutral-300 tracking-[0.18em] uppercase">
                Engineering Biography
              </h4>
              <p className="text-[14px] sm:text-[15px] text-neutral-200 leading-[1.75] max-w-[65ch]">
                {data.biography}
              </p>
            </div>
          </section>

          {/* Internship Objectives */}
          <section className="border border-white/15 bg-[#1b1c1e]/60 p-5 sm:p-6 flex flex-col gap-3">
            <h3 className="text-[12px] font-orbitron font-bold text-white tracking-[0.18em] uppercase">
              Internship Objectives
            </h3>
            <p className="text-[14px] sm:text-[15px] text-neutral-200 leading-[1.75] max-w-[65ch]">
              {data.objective}
            </p>
          </section>

          {/* Host Training Establishment Context */}
          <section className="border border-white/15 bg-[#1b1c1e]/40 p-5 sm:p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-3">
              <h3 className="text-[12px] font-orbitron font-bold text-white tracking-[0.18em] uppercase">
                Host Establishment Assignment
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 uppercase">
                {hteData.designation}
              </span>
            </div>
            <p className="text-[13px] font-orbitron font-semibold text-neutral-200 uppercase tracking-wider">
              {hteData.name}
            </p>
            <p className="text-[14px] text-neutral-300 leading-[1.7] max-w-[65ch]">
              {hteData.details}
            </p>
          </section>
        </div>

        {/* Right Column: Contact Directory & Technical Competencies (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Contact Details Directory */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] text-neutral-400 font-mono tracking-[0.2em] uppercase font-semibold">
              Direct Contact Channels
            </h3>
            <div className="border border-white/15 bg-[#1b1c1e]/75 divide-y divide-white/10">
              {data.contactInfo.map((contact, idx) => {
                const isExternal = contact.href.startsWith("http");
                return (
                  <Link
                    key={idx}
                    href={contact.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    className="min-h-[52px] px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase shrink-0">
                      {contact.label}
                    </span>
                    <span className="text-[13px] text-white group-hover:text-emerald-300 transition-colors break-all font-mono flex items-center gap-1.5">
                      <span>{contact.value}</span>
                      <span
                        aria-hidden="true"
                        className="text-neutral-500 group-hover:text-emerald-300 text-[11px]"
                      >
                        ↗
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Technical Competencies */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] text-neutral-400 font-mono tracking-[0.2em] uppercase font-semibold">
              Core Technical Competencies
            </h3>
            <div className="border border-white/15 bg-[#1b1c1e]/50 p-5 flex flex-wrap gap-2.5">
              {data.skillSet.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 border border-white/15 bg-[#252525] text-[12px] font-mono text-neutral-200 tracking-wide hover:border-white/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
