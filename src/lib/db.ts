import fs from "fs/promises";
import path from "path";
import { supabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export async function readData<T>(fileName: string): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("cms_data")
        .select("value")
        .eq("key", fileName)
        .maybeSingle(); // Use maybeSingle to avoid 406/PGRST116 errors when no row is found
      
      if (data && !error) {
        return data.value as T;
      }
      
      console.warn(`Key ${fileName} not found in Supabase. Reading from local filesystem and auto-seeding...`);
    } catch (e) {
      console.error("Failed to read from Supabase:", e);
    }
  }

  // Fallback to reading from local filesystem
  const filePath = path.join(DATA_DIR, fileName);
  const localData = await fs.readFile(filePath, "utf-8");
  const parsedData = JSON.parse(localData) as T;

  // Auto-seed: If supabase is active but didn't have data, write this local data to it
  if (supabase) {
    try {
      console.log(`Auto-seeding local data for ${fileName} to Supabase...`);
      await supabase
        .from("cms_data")
        .upsert({ key: fileName, value: parsedData, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error("Auto-seeding to Supabase failed:", e);
    }
  }

  return parsedData;
}

export async function writeData<T>(fileName: string, data: T): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("cms_data")
        .upsert({ key: fileName, value: data, updated_at: new Date().toISOString() });
      
      if (!error) {
        // Successfully wrote to Supabase.
        // Try writing to local FS so local files stay in sync during dev, but catch write errors for read-only hosts
        try {
          const filePath = path.join(DATA_DIR, fileName);
          await fs.mkdir(DATA_DIR, { recursive: true });
          await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        } catch (localWriteError) {
          console.warn("Local filesystem write failed (expected on read-only environments like Vercel):", localWriteError);
        }
        return;
      }
      console.error("Supabase write failed, falling back to local FS:", error);
    } catch (e) {
      console.error("Failed to write to Supabase, falling back to local FS:", e);
    }
  }

  // Fallback / standard local write
  const filePath = path.join(DATA_DIR, fileName);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
