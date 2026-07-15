import Link from "next/link";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

export default async function Requirements() {
  const requirements = await readData<RequirementItem[]>("requirements.json");

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Page Title */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-[20px] md:text-[24px] font-bold font-orbitron tracking-[0.2em] text-white uppercase">
          REQUIREMENTS_LOG
        </h2>
      </div>

      {/* Sleek Grid of Cards with Technical Indexing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 select-none">
        {requirements.map((req, index) => {
          const docNum = String(index + 1).padStart(2, "0");
          const isUploaded = req.href && req.href !== "#";
          
          return (
            <Link 
              key={index} 
              href={req.href}
              target={isUploaded ? "_blank" : undefined}
              className={`p-4 border transition-all flex justify-between items-center group cursor-pointer duration-200 ${
                isUploaded 
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40" 
                  : "border-white/10 bg-neutral-900/10 hover:bg-white/5 hover:border-white/30 active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-4 font-orbitron">
                <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
                  [{docNum}]
                </span>
                <div className="flex flex-col">
                  <span className={`text-[13px] font-semibold transition-colors uppercase tracking-wider ${
                    isUploaded ? "text-emerald-400 group-hover:text-emerald-300" : "text-neutral-300 group-hover:text-white"
                  }`}>
                    {req.name}
                  </span>
                  {req.submissionDate && (
                    <span className="text-[9px] font-mono text-neutral-500 mt-0.5 lowercase">
                      uploaded: {req.submissionDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isUploaded && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 tracking-widest uppercase">
                    SYS_FILE
                  </span>
                )}
                <span className={`transition-all text-xs font-mono font-bold ${
                  isUploaded ? "text-emerald-400 group-hover:translate-x-1" : "text-neutral-500 group-hover:text-white group-hover:translate-x-1"
                }`}>
                  &gt;&gt;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      
    </div>
  );
}