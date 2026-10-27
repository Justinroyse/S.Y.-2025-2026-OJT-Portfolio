import fs from "fs/promises";
import path from "path";
import { commitFileToGitHub, isGitHubConfigured } from "./github";

const DATA_DIR = path.join(process.cwd(), "src", "data");

/**
 * Read structured JSON data from the local repository directory.
 * When pre-rendering on Vercel, this is read at build-time with zero database latency.
 */
export async function readData<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const localData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(localData) as T;
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read data file ${fileName} from ${filePath}:`, error);
    throw new Error(`Data read error for ${fileName}: ${errMessage}`);
  }
}

/**
 * Persist updated JSON data directly to the GitHub repository and local disk.
 */
export async function writeData<T>(fileName: string, data: T): Promise<void> {
  const formattedJson = JSON.stringify(data, null, 2);

  // 1. Commit directly to GitHub if configured (production / Vercel runtime)
  if (isGitHubConfigured()) {
    try {
      await commitFileToGitHub({
        path: `src/data/${fileName}`,
        content: formattedJson,
        message: `chore(cms): update ${fileName}`,
      });
    } catch (githubError: unknown) {
      const errMessage = githubError instanceof Error ? githubError.message : String(githubError);
      console.error(`Failed to commit ${fileName} to GitHub:`, githubError);
      throw new Error(`GitHub persistence failed: ${errMessage}`);
    }
  }

  // 2. Also write to local disk (keeps local files in sync during dev)
  try {
    const filePath = path.join(DATA_DIR, fileName);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, formattedJson, "utf-8");
  } catch (localWriteError) {
    // On read-only serverless runtimes (like Vercel), local write will fail, which is expected
    if (!isGitHubConfigured()) {
      throw localWriteError;
    }
  }
}
