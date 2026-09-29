import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Full-screen glass lightbox. Arrow keys / Esc work; clicking the backdrop closes.
 * `render` draws the side panel for the current item.
 */
export function Lightbox<T>({
  items,
  index,
  onChange,
  onClose,
  image,
  alt,
  render,
}: {
  items: T[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
  image: (item: T) => string;
  alt: (item: T) => string;
  render: (item: T) => ReactNode;
}) {
  const open = index !== null && items[index] !== undefined;
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index! + 1) % items.length);
      if (e.key === "ArrowLeft") onChange((index! - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onChange, onClose]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-xl"
          />

          <motion.div
            className="glass-strong relative grid max-h-full w-full max-w-6xl overflow-hidden rounded-3xl md:grid-cols-[1.6fr_1fr]"
            initial={{ y: 40, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[4/3] bg-black/40 md:aspect-auto md:min-h-[70vh]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={image(item)}
                  src={image(item)}
                  alt={alt(item)}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
              {items.length > 1 && (
                <div className="absolute inset-x-3 bottom-3 flex justify-between">
                  <button
                    aria-label="Previous"
                    onClick={() => onChange((index! - 1 + items.length) % items.length)}
                    className="glass-strong flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="glass-strong self-center rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.2em]">
                    {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <button
                    aria-label="Next"
                    onClick={() => onChange((index! + 1) % items.length)}
                    className="glass-strong flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div
              className="relative max-h-[60vh] overflow-y-auto p-6 md:max-h-[85vh] md:p-10"
              data-lenis-prevent
            >
              <button
                aria-label="Close"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-glass-border transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
              {render(item)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
