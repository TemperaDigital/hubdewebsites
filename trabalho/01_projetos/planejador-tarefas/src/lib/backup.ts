import { db, type Task, type TaskAttachment } from "@/lib/db";

type SerializedAttachment = Omit<TaskAttachment, "blob"> & { dataUrl: string };
type SerializedTask = Omit<Task, "attachments"> & { attachments: SerializedAttachment[] };

const BACKUP_VERSION = 1;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string, type: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  const b = await res.blob();
  return type ? b.slice(0, b.size, type) : b;
}

export async function exportBackup(): Promise<Blob> {
  const tasks = await db.tasks.toArray();
  const serialized: SerializedTask[] = await Promise.all(
    tasks.map(async (t) => ({
      ...t,
      attachments: await Promise.all(
        (t.attachments ?? []).map(async (a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          dataUrl: await blobToDataUrl(a.blob),
        }))
      ),
    }))
  );
  const payload = {
    app: "planejador-tarefas",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: serialized,
  };
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
}

export async function downloadBackup() {
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `planejador-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ImportMode = "merge" | "replace";

export interface ImportResult {
  imported: number;
  skipped: number;
  mode: ImportMode;
}

export async function importBackup(
  file: File,
  mode: ImportMode = "merge"
): Promise<ImportResult> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data || data.app !== "planejador-tarefas" || !Array.isArray(data.tasks)) {
    throw new Error("Arquivo de backup inválido.");
  }

  const incoming: Task[] = await Promise.all(
    (data.tasks as SerializedTask[]).map(async (t) => ({
      ...t,
      id: undefined,
      attachments: await Promise.all(
        (t.attachments ?? []).map(async (a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          blob: await dataUrlToBlob(a.dataUrl, a.type),
        }))
      ),
    }))
  );

  let imported = 0;
  let skipped = 0;

  await db.transaction("rw", db.tasks, async () => {
    if (mode === "replace") {
      await db.tasks.clear();
    }
    const existing = mode === "merge" ? await db.tasks.toArray() : [];
    const keyOf = (t: Pick<Task, "title" | "date" | "createdAt">) =>
      `${t.createdAt}|${t.date}|${t.title}`;
    const existingKeys = new Set(existing.map(keyOf));

    for (const t of incoming) {
      if (mode === "merge" && existingKeys.has(keyOf(t))) {
        skipped++;
        continue;
      }
      await db.tasks.add(t);
      imported++;
    }
  });

  return { imported, skipped, mode };
}