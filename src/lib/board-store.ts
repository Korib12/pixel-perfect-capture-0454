/**
 * Tiny IndexedDB store for the portal photo board. Everything lives in the
 * visitor's own browser (per signed-in user) — nothing is uploaded anywhere.
 */

export type BoardProject = {
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

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("owner", "owner");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
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

export async function listProjects(owner: string): Promise<BoardProject[]> {
  const all = await tx<BoardProject[]>("readonly", (s) => s.index("owner").getAll(owner));
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export const saveProject = (p: BoardProject) => tx("readwrite", (s) => s.put(p));
export const deleteProject = (id: string) => tx("readwrite", (s) => s.delete(id));

/** Downscale to a sensible size so the browser store stays small. */
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
    return file; // unsupported format for canvas — keep the original
  }
}
