import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "motion/react";
import { useLenis } from "@/lib/smooth-scroll";

type Section = { id: string; label: string; el: HTMLElement };

/**
 * Instrument-style overlay: page progress readout, a thin progress rail,
 * and a clickable index of every element marked with data-section.
 */
export function ScrollHud() {
  const lenis = useLenis();
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const pctRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.985 && sections.length) setActive(sections.length - 1);
    const p = Math.round(v * 100);
    if (p !== pctRef.current) {
      pctRef.current = p;
      setPct(p);
    }
  });

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    setSections(els.map((el, i) => ({ id: `s${i}`, label: el.dataset["section"] ?? "", el })));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (el: HTMLElement) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* top progress hairline */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent"
        style={{ scaleX: bar }}
      />

      {/* section index */}
      <nav
        aria-label="Page sections"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(s.el)}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.28em]"
          >
            <span
              className={
                "transition-all duration-500 " +
                (i === active
                  ? "translate-x-0 text-foreground opacity-100"
                  : "translate-x-2 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100")
              }
            >
              {s.label}
            </span>
            <span
              className={
                "block h-px transition-all duration-500 " +
                (i === active
                  ? "w-10 bg-accent"
                  : "w-4 bg-glass-border group-hover:w-6 group-hover:bg-foreground")
              }
            />
          </button>
        ))}
      </nav>

      {/* readout */}
      <div className="glass pointer-events-none fixed bottom-5 left-6 z-40 hidden items-center gap-4 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:flex">
        <span className="tabular-nums text-foreground">{String(pct).padStart(3, "0")}%</span>
        <span className="h-px w-8 bg-glass-border" />
        <span className="tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
        </span>
        <span className="text-foreground/80">{sections[active]?.label}</span>
      </div>
    </>
  );
}
