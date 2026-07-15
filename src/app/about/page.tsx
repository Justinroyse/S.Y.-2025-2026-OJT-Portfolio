import Link from "next/link";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ContactItem {
  label: string;
  value: string;
  href: string;
}

interface AboutData {
  name: string;
  course: string;
  studentId: string;
  biography: string;
  objective: string;
  contactInfo: ContactItem[];
  skillSet: string[];
}

export default async function About() {
  const data = await readData<AboutData>("about.json");

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Page Title */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-[20px] md:text-[24px] font-bold font-orbitron tracking-[0.2em] text-white uppercase">
          ABOUT_ME
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Biography & OJT Objectives */}
        <div className="flex flex-col gap-8">
          {/* Biography */}
          <div className="flex flex-col gap-3 font-orbitron">
            <h3 className="text-[11px] text-neutral-500 font-mono tracking-[0.25em] uppercase font-bold">
              {"// BIOGRAPHY"}
            </h3>
            <p className="text-[14px] text-neutral-300 leading-relaxed font-normal tracking-wide normal-case">
              {data.biography}
            </p>
          </div>

          {/* Objectives */}
          <div className="flex flex-col gap-3 font-orbitron">
            <h3 className="text-[11px] text-neutral-500 font-mono tracking-[0.25em] uppercase font-bold">
              {"// INTERNSHIP OBJECTIVES"}
            </h3>
            <p className="text-[14px] text-neutral-300 leading-relaxed font-normal tracking-wide normal-case">
              {data.objective}
            </p>
          </div>
        </div>

        {/* Right Column: Contact Details & Competencies */}
        <div className="flex flex-col gap-8">
          
          {/* Contact Details Card */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] text-neutral-500 font-mono tracking-[0.25em] uppercase font-bold font-orbitron">
              {"// CONTACT"}
            </h3>
            <div className="border border-white/10 bg-neutral-900/10 p-6 flex flex-col gap-4 font-orbitron">
              {data.contactInfo.map((contact, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-white/5 pb-2 last:border-b-0 last:pb-0 gap-1"
                >
                  <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                    {contact.label}
                  </span>
                  <Link
                    href={contact.href}
                    target="_blank"
                    className="text-[12px] text-white hover:text-neutral-300 hover:underline transition-colors tracking-wide break-all cursor-pointer"
                  >
                    {contact.value}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Competencies Tags */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] text-neutral-500 font-mono tracking-[0.25em] uppercase font-bold font-orbitron">
              {"// COMPETENCIES"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skillSet.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 border border-white/10 bg-neutral-900/20 text-[11px] font-orbitron text-neutral-300 tracking-wider uppercase rounded-none hover:border-white/30 hover:bg-neutral-800/30 transition-all duration-200 select-none"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}