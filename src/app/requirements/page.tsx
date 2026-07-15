import { readData } from "@/lib/db";
import RequirementsList from "@/components/ui/RequirementsList";

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

      {/* Delegated list & viewer */}
      <RequirementsList requirements={requirements} />
      
    </div>
  );
}