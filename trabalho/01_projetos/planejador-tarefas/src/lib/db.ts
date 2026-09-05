import Dexie, { type Table } from "dexie";

export type TaskType = "profissional" | "pessoal";

export interface TaskAttachment {
  name: string;
  type: string;
  size: number;
  blob: Blob;
}

export interface Publicacao {
  boletim: string;
  data: string; // ISO date
}

export interface Task {
  id?: number;
  ownerUserId: string;
  title: string;
  description: string;
  date: string; // ISO date (yyyy-mm-dd)
  deadline?: string; // ISO datetime
  type: TaskType;
  origem?: string;
  nup?: string;
  responsavel?: string;
  publicacao?: Publicacao;
  done: boolean;
  solucao?: string;
  completedAt?: string;
  attachments: TaskAttachment[];
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}

class AppDB extends Dexie {
  tasks!: Table<Task, number>;

  constructor() {
    super("planejador-db");
    this.version(1).stores({
      tasks: "++id, ownerUserId, date, deadline, done, type, nup, [ownerUserId+date], [ownerUserId+done]",
    });
  }
}

export const db = new AppDB();

export async function listTasks(ownerUserId: string) {
  return db.tasks.where({ ownerUserId }).toArray();
}

export async function todayTasks(ownerUserId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const all = await db.tasks.where({ ownerUserId }).toArray();
  return all.filter((t) => !t.done || t.date === today);
}

export async function historyTasks(ownerUserId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const all = await db.tasks.where({ ownerUserId }).toArray();
  return all.filter((t) => t.done || t.date < today);
}

export async function saveTask(t: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: number }) {
  const now = new Date().toISOString();
  if (t.id) {
    await db.tasks.update(t.id, { ...t, updatedAt: now });
    return t.id;
  }
  return db.tasks.add({ ...t, createdAt: now, updatedAt: now } as Task);
}

export async function deleteTask(id: number) {
  await db.tasks.delete(id);
}

export async function toggleDone(id: number, done: boolean, solucao?: string) {
  await db.tasks.update(id, {
    done,
    solucao,
    completedAt: done ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  });
}