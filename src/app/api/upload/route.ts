import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { readData, writeData } from "@/lib/db";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const reqKey = formData.get("key") as string | null;

    if (!file || !reqKey) {
      return NextResponse.json({ error: "Missing file or requirement key" }, { status: 400 });
    }

    const requirements = await readData<RequirementItem[]>("requirements.json");
    const itemIndex = requirements.findIndex((r) => r.key === reqKey);

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Requirement key not found" }, { status: 400 });
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Configure paths
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".pdf";
    const filename = `${reqKey}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filePath, buffer);

    // Update requirements db
    const fileUrl = `/uploads/${filename}`;
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    requirements[itemIndex] = {
      ...requirements[itemIndex],
      href: fileUrl,
      submissionDate: today,
    };

    await writeData("requirements.json", requirements);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload processing failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const requirements = await readData<RequirementItem[]>("requirements.json");
    const idx = requirements.findIndex((r) => r.key === key);

    if (idx === -1) {
      return NextResponse.json({ error: "Requirement key not found" }, { status: 400 });
    }

    const currentUrl = requirements[idx].href;
    if (currentUrl && currentUrl !== "#") {
      // Resolve path
      const filePath = path.join(process.cwd(), "public", currentUrl);
      try {
        await fs.unlink(filePath);
      } catch {
        console.warn("File was already deleted or not found: ", filePath);
      }
    }

    // Reset database item
    requirements[idx] = {
      ...requirements[idx],
      href: "#",
      submissionDate: undefined,
    };

    await writeData("requirements.json", requirements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "File deletion failed" }, { status: 500 });
  }
}
