import { readData } from "@/lib/db";
import RequirementsList from "@/components/ui/RequirementsList";

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

export default async function Requirements() {
  const requirements = await readData<RequirementItem[]>("requirements.json");

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
            SECTION 03 // COMPLIANCE ARCHIVE
          </span>
          <h2 className="text-[20px] sm:text-[24px] font-bold font-orbitron tracking-[0.16em] text-white uppercase mt-1">
            OJT Requirements Checklist
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
          {requirements.length} REQUIRED DELIVERABLES
        </span>
      </div>

      {/* Interactive Requirements Checklist & Inline Document Viewer */}
      <RequirementsList requirements={requirements} />
    </div>
  );
}
