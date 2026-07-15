import Link from "next/link";

const requirements = [
  { name: "Approval Sheet", href: "#" },
  { name: "Company Profile", href: "#" },
  { name: "Memorandum of Agreement", href: "#" },
  { name: "Letter of Intent", href: "#" },
  { name: "Letter of Endorsement", href: "#" },
  { name: "Student Waiver", href: "#" },
  { name: "Internship Agreement", href: "#" },
  { name: "Consent Form", href: "#" },
  { name: "Resume / CV", href: "#" },
  { name: "Medical Certificate", href: "#" },
  { name: "Insurance", href: "#" },
  { name: "Weekly Report", href: "#" },
  { name: "Weekly Photo Documentation", href: "#" },
  { name: "Certificate of Completion", href: "#" },
  { name: "Evaluation for Student Internship", href: "#" },
  { name: "Evaluation for Supervisor", href: "#" },
  { name: "Evaluation Instrument for HTE", href: "#" }
];

export default function Requirements() {
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
          return (
            <Link 
              key={index} 
              href={req.href}
              className="p-4 border border-white/10 bg-neutral-900/10 hover:bg-white/5 hover:border-white/30 active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer duration-200"
            >
              <div className="flex items-center gap-4 font-orbitron">
                <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
                  [{docNum}]
                </span>
                <span className="text-[13px] font-semibold text-neutral-300 group-hover:text-white transition-colors uppercase tracking-wider">
                  {req.name}
                </span>
              </div>
              <span className="text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all text-xs font-mono font-bold">
                &gt;&gt;
              </span>
            </Link>
          );
        })}
      </div>
      
    </div>
  );
}