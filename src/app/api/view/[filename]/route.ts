import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isGitHubConfigured } from "@/lib/github";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "Justinroyse";
const GITHUB_REPO = process.env.GITHUB_REPO || "S.Y.-2025-2026-OJT-Portfolio";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".txt": "text/plain",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return new NextResponse("File not found", { status: 404 });
  }

  // Prevent directory traversal
  const safeFilename = path.basename(filename);
  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  let fileBuffer: Buffer | null = null;

  // 1. Try local filesystem (for local development or pre-bundled files)
  try {
    const localPath = path.join(process.cwd(), "public", "uploads", safeFilename);
    fileBuffer = await fs.readFile(localPath);
  } catch {
    fileBuffer = null;
  }

  // 2. If not found on local disk, fetch directly from GitHub repository
  if (!fileBuffer && isGitHubConfigured()) {
    try {
      const gitHubUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/public/uploads/${safeFilename}`;
      const res = await fetch(gitHubUrl, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "User-Agent": "Nextjs-OJT-Portfolio",
        },
        cache: "no-store",
      });

      if (res.ok) {
        fileBuffer = Buffer.from(await res.arrayBuffer());
      }
    } catch (err) {
      console.error(`Failed to fetch ${safeFilename} from GitHub:`, err);
    }
  }

  if (!fileBuffer) {
    return new NextResponse("Document not found", { status: 404 });
  }

  // Return with Content-Disposition: inline so the browser renders it live instead of downloading
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${safeFilename}"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
