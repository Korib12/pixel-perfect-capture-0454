import { useEffect, useRef, useState } from "react";

/**
 * Dot + trailing ring. Over links the ring grows; over anything with
 * data-cursor="Label" it becomes a filled disc showing that label.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "hover">("idle");
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let labelled = false;
    let hoverState = false;
    let current: string | null = null;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      const next = tagged?.dataset["cursor"] ?? null;
      labelled = !!next;
      if (next !== current) {
        current = next;
        setLabel(next);
      }
      const h =
        !labelled && !!el?.closest("a,button,[data-cursor-hover],input,textarea,select,label");
      if (h !== hoverState) {
        hoverState = h;
        setMode(h ? "hover" : "idle");
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${labelled ? 0 : 1})`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = window.requestAnimationFrame(loop);
    document.documentElement.classList.add("no-native-cursor");

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.cancelAnimationFrame(raf);
      document.documentElement.classList.remove("no-native-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1.5 w-1.5 rounded-full bg-accent transition-[scale] duration-300"
      />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[150]">
        <div
          className={
            "flex items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (label
              ? "h-20 w-20 border-transparent bg-accent"
              : mode === "hover"
                ? "h-14 w-14 border-foreground/40 bg-foreground/5"
                : "h-9 w-9 border-glass-border bg-transparent") +
            (pressed ? " scale-90" : "")
          }
        >
          <span
            className={
              "text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-opacity duration-300 " +
              (label ? "opacity-100 delay-100" : "opacity-0")
            }
          >
            {label}
          </span>
        </div>
      </div>
    </>
  );
}
