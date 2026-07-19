import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { readData, writeData } from "@/lib/db";
import { supabase } from "@/lib/supabase";

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

// Reusable helper to delete file from storage (Supabase or local FS)
async function deleteFileFromStorage(currentUrl: string) {
  if (!currentUrl || currentUrl === "#") return;

  if (supabase && currentUrl.includes("supabase.co/storage")) {
    const filename = currentUrl.split("/").pop();
    if (filename) {
      const { error: deleteError } = await supabase.storage
        .from("uploads")
        .remove([filename]);
      
      if (deleteError) {
        console.warn("Failed to delete file from Supabase storage:", deleteError);
      }
    }
  } else {
    // Resolve local path
    const filePath = path.join(process.cwd(), "public", currentUrl);
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn("File was already deleted or not found: ", filePath);
    }
  }
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

    const isRequirement = reqKey !== "hte_logo";
    let requirements: RequirementItem[] = [];
    let itemIndex = -1;

    if (isRequirement) {
      requirements = await readData<RequirementItem[]>("requirements.json");
      itemIndex = requirements.findIndex((r) => r.key === reqKey);

      if (itemIndex === -1) {
        return NextResponse.json({ error: "Requirement key not found" }, { status: 400 });
      }
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let fileUrl = "";

    if (supabase) {
      const ext = path.extname(file.name) || ".pdf";
      const filename = `${reqKey}${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filename, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filename);

      fileUrl = publicUrl;
    } else {
      // Local fallback
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".pdf";
      const filename = `${reqKey}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${filename}`;
    }

    if (isRequirement) {
      // Update requirements db
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
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Upload processing failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, url } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const isRequirement = key !== "hte_logo";

    if (isRequirement) {
      const requirements = await readData<RequirementItem[]>("requirements.json");
      const idx = requirements.findIndex((r) => r.key === key);

      if (idx === -1) {
        return NextResponse.json({ error: "Requirement key not found" }, { status: 400 });
      }

      const currentUrl = requirements[idx].href;
      await deleteFileFromStorage(currentUrl);

      // Reset database item
      requirements[idx] = {
        ...requirements[idx],
        href: "#",
        submissionDate: undefined,
      };

      await writeData("requirements.json", requirements);
    } else {
      // General file delete (e.g. HTE logo)
      if (url) {
        await deleteFileFromStorage(url);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "File deletion failed" }, { status: 500 });
  }
}
