import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { readData, writeData } from "@/lib/db";
import {
  commitFileToGitHub,
  deleteFileFromGitHub,
  isGitHubConfigured,
} from "@/lib/github";

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

interface HTEData {
  name: string;
  designation: string;
  details: string;
  logoUrl: string;
}

interface AboutData {
  name: string;
  course: string;
  studentId: string;
  avatarUrl?: string;
  biography: string;
  objective: string;
  contactInfo: { label: string; value: string; href: string }[];
  skillSet: string[];
}

/**
 * Helper to delete a file from GitHub repository and local disk.
 */
async function deleteFileFromStorage(currentUrl: string, key?: string) {
  if (!currentUrl || currentUrl === "#") return;

  let relativePath = "";
  if (currentUrl.startsWith("http")) {
    try {
      const parsed = new URL(currentUrl);
      const match = parsed.pathname.match(/public\/uploads\/.+$/);
      if (match) {
        relativePath = match[0];
      } else {
        const filename = parsed.pathname.split("/").pop();
        if (filename) relativePath = `public/uploads/${filename}`;
      }
    } catch {
      if (key) relativePath = `public/uploads/${key}.pdf`;
    }
  } else if (currentUrl.startsWith("/uploads/")) {
    relativePath = `public${currentUrl}`;
  } else if (currentUrl.startsWith("/api/view/")) {
    const filename = currentUrl.split("/").pop();
    if (filename) relativePath = `public/uploads/${filename}`;
  }

  if (relativePath && isGitHubConfigured()) {
    try {
      await deleteFileFromGitHub({
        path: relativePath,
        message: `chore(upload): delete ${relativePath.split("/").pop()}`,
      });
    } catch (e) {
      console.warn("Failed to delete from GitHub:", e);
    }
  }

  // Also remove from local filesystem if present
  try {
    const filename = relativePath
      ? path.basename(relativePath)
      : currentUrl.split("/").pop();
    if (filename) {
      const localPath = path.join(process.cwd(), "public", "uploads", filename);
      await fs.unlink(localPath);
    }
  } catch {
    // Ignore if not present locally
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
      return NextResponse.json(
        { error: "Missing file or requirement key" },
        { status: 400 }
      );
    }

    const isHteLogo = reqKey === "hte_logo";
    const isProfilePhoto = reqKey === "profile_photo";
    const isRequirement = !isHteLogo && !isProfilePhoto;
    let requirements: RequirementItem[] = [];
    let itemIndex = -1;

    if (isRequirement) {
      requirements = await readData<RequirementItem[]>("requirements.json");
      itemIndex = requirements.findIndex((r) => r.key === reqKey);

      if (itemIndex === -1) {
        return NextResponse.json(
          { error: "Requirement key not found" },
          { status: 400 }
        );
      }
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (isRequirement ? ".pdf" : ".png");
    const filename = `${reqKey}${ext}`;
    const repoPath = `public/uploads/${filename}`;
    const fileUrl = `/api/view/${filename}`;

    // 1. Commit to GitHub repository if configured
    if (isGitHubConfigured()) {
      await commitFileToGitHub({
        path: repoPath,
        content: buffer,
        message: `feat(upload): upload ${filename}`,
      });
    }

    // 2. Also write to local filesystem for instant dev access
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
    } catch (fsErr) {
      // Expected error on read-only environments like Vercel
      if (!isGitHubConfigured()) {
        throw fsErr;
      }
    }

    if (isRequirement) {
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
    } else if (isHteLogo) {
      const hte = await readData<HTEData>("hte.json");
      hte.logoUrl = fileUrl;
      await writeData("hte.json", hte);
    } else if (isProfilePhoto) {
      const about = await readData<AboutData>("about.json");
      about.avatarUrl = fileUrl;
      await writeData("about.json", about);
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Upload processing failed";
    console.error("Upload error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
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

    const isHteLogo = key === "hte_logo";
    const isProfilePhoto = key === "profile_photo";
    const isRequirement = !isHteLogo && !isProfilePhoto;

    if (isRequirement) {
      const requirements =
        await readData<RequirementItem[]>("requirements.json");
      const idx = requirements.findIndex((r) => r.key === key);

      if (idx === -1) {
        return NextResponse.json(
          { error: "Requirement key not found" },
          { status: 400 }
        );
      }

      const currentUrl = requirements[idx].href;
      await deleteFileFromStorage(currentUrl, key);

      requirements[idx] = {
        ...requirements[idx],
        href: "#",
        submissionDate: undefined,
      };

      await writeData("requirements.json", requirements);
    } else if (isHteLogo) {
      const hte = await readData<HTEData>("hte.json");
      const targetUrl = url || hte.logoUrl;
      if (targetUrl) {
        await deleteFileFromStorage(targetUrl, key);
      }
      hte.logoUrl = "";
      await writeData("hte.json", hte);
    } else if (isProfilePhoto) {
      const about = await readData<AboutData>("about.json");
      const targetUrl = url || about.avatarUrl;
      if (targetUrl) {
        await deleteFileFromStorage(targetUrl, key);
      }
      about.avatarUrl = "";
      await writeData("about.json", about);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "File deletion failed";
    console.error("Delete error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
