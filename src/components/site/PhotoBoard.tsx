import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Cloud,
  HardDrive,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addProject,
  compressImage,
  loadBoard,
  removeProject,
  type BoardMode,
  type ShownProject,
} from "@/lib/board-store";
import { Lightbox } from "./Lightbox";

const EASE = [0.16, 1, 0.3, 1] as const;

type Pending = { id: string; blob: Blob; url: string };
type Shown = ShownProject;

const revoke = (urls: string[]) =>
  urls.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function PhotoBoard({ owner, name }: { owner: string; name: string }) {
  const [projects, setProjects] = useState<Shown[]>([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [mode, setMode] = useState<BoardMode>("cloud");

  const load = useCallback(async () => {
    try {
      const res = await loadBoard(owner);
      setMode(res.mode);
      setProjects((prev) => {
        prev.forEach((p) => revoke(p.urls));
        return res.projects;
      });
      if (res.moved) {
        toast.success(
          `Moved ${res.moved} project${res.moved === 1 ? "" : "s"} from this device into your account.`,
        );
      }
    } catch {
      toast.error("Couldn't load your board. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    void load();
  }, [load]);

  const live = useRef<Shown[]>([]);
  live.current = projects;
  useEffect(() => () => live.current.forEach((p) => revoke(p.urls)), []);

  const photoCount = projects.reduce((n, p) => n + p.urls.length, 0);

  // Lightbox walks every photo across every project.
  const flat = useMemo(
    () => projects.flatMap((p) => p.urls.map((url, i) => ({ url, i, p }))),
    [projects],
  );
  const openProject = (id: string) => setOpen(flat.findIndex((f) => f.p.id === id));

  const remove = async (p: Shown) => {
    try {
      await removeProject(mode, p);
      toast.message("Project removed from your board.");
    } catch {
      toast.error("Couldn't delete that project. Please try again.");
    }
    void load();
  };

  return (
    <div>
      {/* header */}
      <div className="glass-strong glass-spot relative overflow-hidden rounded-3xl p-6 md:p-10">
        {projects[0] && (
          <img
            src={projects[0].urls[0]}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
          />
        )}
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Your board</p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
              {name}'s work
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {String(projects.length).padStart(2, "0")} projects ·{" "}
              {String(photoCount).padStart(2, "0")} photos
            </p>
          </div>
          <button
            onClick={() => setComposer(true)}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground"
          >
            <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <Plus className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
            <span className="relative">Add project</span>
          </button>
        </div>
      </div>

      {!loading && (
        <p className="mt-3 flex items-center gap-2 px-2 text-xs text-muted-foreground">
          {mode === "cloud" ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-accent" /> Saved to your account — private to you,
              on any device.
            </>
          ) : (
            <>
              <HardDrive className="h-3.5 w-3.5" /> Saved on this device for now. It'll move into
              your account automatically once account saving is switched on.
            </>
          )}
        </p>
      )}

      {/* board */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onAdd={() => setComposer(true)} />
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            <AnimatePresence>
              {projects.map((p, i) => (
                <ProjectTile
                  key={p.id}
                  p={p}
                  i={i}
                  onOpen={() => openProject(p.id)}
                  onDelete={() => void remove(p)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {composer && (
          <Composer
            owner={owner}
            mode={mode}
            onClose={() => setComposer(false)}
            onSaved={() => {
              setComposer(false);
              void load();
            }}
          />
        )}
      </AnimatePresence>

      <Lightbox
        items={flat}
        index={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
        image={(f) => f.url}
        alt={(f) => f.p.title}
        render={(f) => (
          <div>
            <p className="eyebrow">
              Photo {f.i + 1} of {f.p.urls.length}
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-none">
              {f.p.title}
            </h3>
            {f.p.location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {f.p.location}
              </p>
            )}
            {f.p.description && (
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
                {f.p.description}
              </p>
            )}
            {f.p.urls.length > 1 && (
              <div className="mt-8 grid grid-cols-4 gap-2">
                {f.p.urls.map((u, k) => (
                  <button
                    key={u}
                    onClick={() => setOpen(flat.findIndex((x) => x.url === u))}
                    className={
                      "aspect-square overflow-hidden rounded-lg ring-2 transition " +
                      (k === f.i ? "ring-accent" : "ring-transparent opacity-60 hover:opacity-100")
                    }
                  >
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Added {new Date(f.p.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="glass glass-spot group flex w-full flex-col items-center justify-center rounded-3xl border-dashed px-6 py-24 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-glass-border transition-transform duration-500 group-hover:scale-110 group-hover:border-accent group-hover:text-accent">
        <ImagePlus className="h-6 w-6" />
      </span>
      <span className="mt-6 font-display text-2xl font-bold uppercase">Start your board</span>
      <span className="mt-2 max-w-sm text-sm text-muted-foreground">
        Upload photos of a project, give it a name and a line or two, and we'll lay it out for you.
      </span>
    </button>
  );
}

function ProjectTile({
  p,
  i,
  onOpen,
  onDelete,
}: {
  p: Shown;
  i: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  // alternate crops so the masonry has rhythm
  const aspect = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square", "aspect-[3/4]"][i % 4];
  const [confirm, setConfirm] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      transition={{ duration: 0.7, delay: Math.min(i, 6) * 0.05, ease: EASE }}
      className="group relative break-inside-avoid overflow-hidden rounded-2xl"
    >
      <button onClick={onOpen} data-cursor="Open" className={"relative block w-full " + aspect}>
        <img
          src={p.urls[0]}
          alt={p.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
      </button>

      {p.urls.length > 1 && (
        <div className="pointer-events-none absolute left-3 top-3 flex -space-x-2">
          {p.urls.slice(1, 4).map((u) => (
            <img
              key={u}
              src={u}
              alt=""
              className="h-8 w-8 rounded-lg border border-white/30 object-cover shadow-lg"
            />
          ))}
          <span className="glass-strong ml-3 self-center rounded-full px-2.5 py-1 font-mono text-[10px]">
            {p.urls.length} photos
          </span>
        </div>
      )}

      <button
        onClick={() => (confirm ? onDelete() : setConfirm(true))}
        onMouseLeave={() => setConfirm(false)}
        aria-label="Delete project"
        className={
          "glass-strong absolute right-3 top-3 flex h-9 items-center gap-2 rounded-full px-2.5 text-[10px] uppercase tracking-[0.16em] opacity-0 transition-all duration-300 group-hover:opacity-100 focus:opacity-100 " +
          (confirm ? "bg-destructive/80 text-white" : "hover:text-destructive")
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
        {confirm && "Delete?"}
      </button>

      <div className="glass-strong pointer-events-none absolute inset-x-3 bottom-3 rounded-xl p-4">
        <h3 className="font-display text-lg font-bold uppercase leading-tight">{p.title}</h3>
        {p.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {p.location}
          </p>
        )}
        {p.description && (
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-hover:grid-rows-[1fr]">
            <p className="line-clamp-3 overflow-hidden text-sm leading-relaxed text-foreground/80">
              <span className="block pt-2">{p.description}</span>
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function Composer({
  owner,
  mode,
  onClose,
  onSaved,
}: {
  owner: string;
  mode: BoardMode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const livePending = useRef<Pending[]>([]);
  livePending.current = pending;
  // on close, free any previews that weren't saved (saved ones are re-created from the store)
  useEffect(() => () => livePending.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      toast.error("Those don't look like images.");
      return;
    }
    setBusy(true);
    const next = await Promise.all(
      images.slice(0, 12).map(async (f) => {
        const blob = await compressImage(f);
        return { id: uid(), blob, url: URL.createObjectURL(blob) };
      }),
    );
    setPending((p) => [...p, ...next].slice(0, 12));
    const guess = images[0]?.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") ?? "";
    setTitle((t) => t || guess);
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending.length) {
      toast.error("Add at least one photo.");
      return;
    }
    setBusy(true);
    try {
      await addProject(owner, mode, {
        title: title.trim() || "Untitled project",
        location: location.trim(),
        description: description.trim(),
        photos: pending.map((p) => p.blob),
      });
      toast.success("Added to your board.");
      onSaved();
    } catch {
      toast.error(
        mode === "cloud"
          ? "Upload failed. Check your connection and try again."
          : "Couldn't save — your browser may be out of space.",
      );
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center p-3 md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-xl"
      />
      <motion.form
        onSubmit={submit}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        data-lenis-prevent
        className="glass-strong relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6 md:p-10"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase">New project</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void addFiles(e.dataTransfer.files);
          }}
          onClick={() => input.current?.click()}
          className={
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 " +
            (drag
              ? "scale-[1.01] border-accent bg-accent/10"
              : "border-glass-border hover:border-foreground/40")
          }
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Upload
              className={
                "h-6 w-6 transition-colors " + (drag ? "text-accent" : "text-muted-foreground")
              }
            />
          )}
          <p className="mt-3 text-sm">
            <span className="text-foreground">Drop photos here</span>{" "}
            <span className="text-muted-foreground">or click to choose · up to 12</span>
          </p>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {pending.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2 md:grid-cols-6">
            <AnimatePresence>
              {pending.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent-foreground">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPending((all) => all.filter((x) => x.id !== p.id))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Project name</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lakeside Pavilion"
              className="mt-2 w-full border-b border-glass-border bg-transparent py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Location (optional)</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country"
              className="mt-2 w-full border-b border-glass-border bg-transparent py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className="eyebrow">A few words</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="What it is, what you're proud of…"
            className="mt-2 w-full resize-none border-b border-glass-border bg-transparent py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
          />
        </label>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-glass-border px-5 py-3 text-xs uppercase tracking-[0.18em] hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !pending.length}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs uppercase tracking-[0.18em] text-accent-foreground transition-opacity disabled:opacity-40"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Add to board
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
