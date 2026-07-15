import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readData, writeData } from "@/lib/db";

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

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

interface LogEntry {
  id: string;
  week: string;
  dates: string;
  hours: string;
  status: string;
  tasks: string[];
}

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

interface HTEData {
  name: string;
  designation: string;
  details: string;
  logoUrl: string;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const about = await readData<AboutData>("about.json");
    const logs = await readData<LogEntry[]>("logs.json");
    const requirements = await readData<RequirementItem[]>("requirements.json");
    const hte = await readData<HTEData>("hte.json");
    return NextResponse.json({ about, logs, requirements, hte });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load databases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "update-about") {
      const aboutData = await readData<AboutData>("about.json");
      const updated = { ...aboutData, ...payload };
      await writeData("about.json", updated);
      return NextResponse.json({ success: true });
    }

    if (action === "update-hte") {
      const hteData = await readData<HTEData>("hte.json");
      const updated = { ...hteData, ...payload };
      await writeData("hte.json", updated);
      return NextResponse.json({ success: true });
    }

    if (action === "add-log") {
      const logs = await readData<LogEntry[]>("logs.json");
      const newLog: LogEntry = {
        id: Date.now().toString(),
        week: payload.week || `WEEK ${String(logs.length + 1).padStart(2, "0")}`,
        dates: payload.dates || "",
        hours: payload.hours || "40 HOURS",
        status: payload.status || "APPROVED",
        tasks: payload.tasks || [],
      };
      logs.push(newLog);
      await writeData("logs.json", logs);
      return NextResponse.json({ success: true, log: newLog });
    }

    if (action === "edit-log") {
      const logs = await readData<LogEntry[]>("logs.json");
      const idx = logs.findIndex((l) => l.id === payload.id);
      if (idx === -1) {
        return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
      }
      logs[idx] = {
        ...logs[idx],
        week: payload.week,
        dates: payload.dates,
        hours: payload.hours,
        status: payload.status,
        tasks: payload.tasks,
      };
      await writeData("logs.json", logs);
      return NextResponse.json({ success: true });
    }

    if (action === "delete-log") {
      const logs = await readData<LogEntry[]>("logs.json");
      const updated = logs.filter((l) => l.id !== payload.id);
      await writeData("logs.json", updated);
      return NextResponse.json({ success: true });
    }

    // Support updating requirements list definition (rename, delete, add custom)
    if (action === "update-requirements-list") {
      await writeData("requirements.json", payload);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
