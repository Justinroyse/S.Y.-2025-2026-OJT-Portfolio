/**
 * Lightweight GitHub REST API client for committing files and CMS records.
 * Uses native Node fetch with zero external dependencies to keep bundle size minimal.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "Justinroyse";
const GITHUB_REPO = process.env.GITHUB_REPO || "S.Y.-2025-2026-OJT-Portfolio";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export function isGitHubConfigured(): boolean {
  return Boolean(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
}

export function getGitHubRawUrl(filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${cleanPath}`;
}

interface GitHubFileResponse {
  sha?: string;
  message?: string;
}

/**
 * Fetch the current SHA of a file in the repository (needed for updating/deleting existing files).
 */
export async function getFileSha(filePath: string): Promise<string | null> {
  if (!isGitHubConfigured()) return null;

  const cleanPath = filePath.replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${cleanPath}?ref=${GITHUB_BRANCH}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "Nextjs-OJT-Portfolio",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[GitHub API] getFileSha failed for ${cleanPath}: ${res.status} ${errorText}`);
      return null;
    }

    const data = (await res.json()) as GitHubFileResponse;
    return data.sha || null;
  } catch (error) {
    console.error(`[GitHub API] Network error getting SHA for ${cleanPath}:`, error);
    return null;
  }
}

interface CommitOptions {
  path: string;
  content: Buffer | string;
  message: string;
}

interface CommitResult {
  success: boolean;
  sha?: string;
  rawUrl: string;
}

/**
 * Commits a file (binary buffer or UTF-8 string) directly to the GitHub repository.
 */
export async function commitFileToGitHub({
  path: filePath,
  content,
  message,
}: CommitOptions): Promise<CommitResult> {
  if (!isGitHubConfigured()) {
    throw new Error("GitHub repository integration is not configured. Missing GITHUB_TOKEN.");
  }

  const cleanPath = filePath.replace(/^\/+/, "");
  const base64Content = Buffer.isBuffer(content)
    ? content.toString("base64")
    : Buffer.from(content, "utf-8").toString("base64");

  // Retrieve current SHA if file already exists
  const sha = await getFileSha(cleanPath);

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${cleanPath}`;
  const body: Record<string, string> = {
    message,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "Nextjs-OJT-Portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${errorBody}`);
  }

  const responseData = await res.json();
  const rawUrl = getGitHubRawUrl(cleanPath);

  return {
    success: true,
    sha: responseData?.content?.sha,
    rawUrl,
  };
}

interface DeleteOptions {
  path: string;
  message: string;
}

/**
 * Deletes a file from the GitHub repository.
 */
export async function deleteFileFromGitHub({
  path: filePath,
  message,
}: DeleteOptions): Promise<{ success: boolean }> {
  if (!isGitHubConfigured()) {
    return { success: false };
  }

  const cleanPath = filePath.replace(/^\/+/, "");
  const sha = await getFileSha(cleanPath);

  if (!sha) {
    // File already doesn't exist
    return { success: true };
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${cleanPath}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "Nextjs-OJT-Portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      sha,
      branch: GITHUB_BRANCH,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub delete failed (${res.status}): ${errorBody}`);
  }

  return { success: true };
}
