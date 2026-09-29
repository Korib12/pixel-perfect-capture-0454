import { useEffect } from "react";

/**
 * Drives the pointer-following highlight on any `.glass-spot` element by
 * setting --mx / --my / --spot-o on whichever panel is under the pointer.
 */
export function GlassLight() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let current: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".glass-spot") ?? null;
      if (el !== current) {
        current?.style.setProperty("--spot-o", "0");
        current = el;
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.style.setProperty("--spot-o", "1");
    };
    const onLeave = () => {
      current?.style.setProperty("--spot-o", "0");
      current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="ambient">
      <span />
      <span />
      <span />
    </div>
  );
}
