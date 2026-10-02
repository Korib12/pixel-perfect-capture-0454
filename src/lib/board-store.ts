/**
 * Storage for the portal photo board.
 *
 * Cloud mode (preferred): projects live in the `board_projects` table and
 * photos in the private `board-photos` bucket, so a user's board follows
 * them to any device. Requires the migration
 * supabase/migrations/20261001170000_board_projects.sql to be applied.
 *
 * Local mode (fallback): if that table doesn't exist yet, projects are kept
 * in the browser's IndexedDB. As soon as cloud mode becomes available, any
 * local projects are moved into the user's account automatically.
 */
import { supabase } from "@/integrations/supabase/client";

export type BoardMode = "cloud" | "local";

export type ShownProject = {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: number;
  urls: string[];
  /** storage paths (cloud) — used for deletes */
  paths: string[];
};

export type Draft = { title: string; description: string; location: string; photos: Blob[] };

const BUCKET = "board-photos";

/* ───────────── local (IndexedDB) ───────────── */

type LocalProject = {
  id: string;
  owner: string;
  title: string;
  description: string;
  location: string;
  photos: Blob[];
  createdAt: number;
};

const DB = "aether-board";
const STORE = "projects";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" }).createIndex("owner", "owner");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

const localList = async (owner: string) => {
  try {
    return await tx<LocalProject[]>("readonly", (s) => s.index("owner").getAll(owner));
  } catch {
    return [];
  }
};
const localPut = (p: LocalProject) => tx("readwrite", (s) => s.put(p));
const localDelete = (id: string) => tx("readwrite", (s) => s.delete(id));

/* ───────────── cloud (Supabase) ───────────── */

const isMissingTable = (e: { code?: string; message?: string } | null) =>
  !!e &&
  (e.code === "42P01" ||
    e.code === "PGRST205" ||
    e.code === "PGRST106" ||
    /board_projects|schema cache|does not exist/i.test(e.message ?? ""));

async function cloudInsert(userId: string, d: Draft & { createdAt?: number }) {
  const id = crypto.randomUUID();
  const paths: string[] = [];
  try {
    for (const [i, blob] of d.photos.entries()) {
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${id}/${i}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
      if (error) throw error;
      paths.push(path);
    }
    const { error } = await supabase.from("board_projects").insert({
      id,
      user_id: userId,
      title: d.title,
      description: d.description,
      location: d.location,
      photo_paths: paths,
      ...(d.createdAt ? { created_at: new Date(d.createdAt).toISOString() } : {}),
    });
    if (error) throw error;
  } catch (err) {
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    throw err;
  }
}

/* ───────────── public API ───────────── */

export async function loadBoard(
  userId: string,
): Promise<{ mode: BoardMode; projects: ShownProject[]; moved: number }> {
  const { data, error } = await supabase
    .from("board_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (!isMissingTable(error)) throw error;
    const local = (await localList(userId)).sort((a, b) => b.createdAt - a.createdAt);
    return {
      mode: "local",
      moved: 0,
      projects: local.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        location: p.location,
        createdAt: p.createdAt,
        urls: p.photos.map((b) => URL.createObjectURL(b)),
        paths: [],
      })),
    };
  }

  // Cloud is live — move anything saved on this device into the account.
  const local = await localList(userId);
  let moved = 0;
  for (const p of local) {
    try {
      await cloudInsert(userId, p);
      await localDelete(p.id);
      moved++;
    } catch {
      /* leave it local and try again next visit */
    }
  }
  if (moved) return loadBoard(userId).then((r) => ({ ...r, moved }));

  const allPaths = data.flatMap((r) => r.photo_paths);
  const signed = new Map<string, string>();
  if (allPaths.length) {
    const { data: urls } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(allPaths, 60 * 60 * 6);
    urls?.forEach((u) => u.path && u.signedUrl && signed.set(u.path, u.signedUrl));
  }

  return {
    mode: "cloud",
    moved: 0,
    projects: data.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      location: r.location,
      createdAt: new Date(r.created_at).getTime(),
      paths: r.photo_paths,
      urls: r.photo_paths.map((p) => signed.get(p)).filter((u): u is string => !!u),
    })),
  };
}

export async function addProject(userId: string, mode: BoardMode, d: Draft) {
  if (mode === "cloud") return cloudInsert(userId, d);
  await localPut({ id: crypto.randomUUID(), owner: userId, createdAt: Date.now(), ...d });
}

export async function removeProject(mode: BoardMode, p: ShownProject) {
  if (mode === "cloud") {
    const { error } = await supabase.from("board_projects").delete().eq("id", p.id);
    if (error) throw error;
    if (p.paths.length) await supabase.storage.from(BUCKET).remove(p.paths);
    return;
  }
  await localDelete(p.id);
}

/** Downscale to a sensible size so uploads stay small and fast. */
export async function compressImage(file: File, max = 1800, quality = 0.85): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", quality),
    );
  } catch {
    return file;
  }
}
