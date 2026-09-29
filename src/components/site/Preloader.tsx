import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScrambleText } from "./ScrambleText";

const KEY = "aether:intro-seen";

// Kept on window (not module state) so every code-split chunk sees the same flag.
const EVENT = "aether:intro-done";
type IntroWindow = Window & { __aetherIntroDone?: boolean };
const isIntroDone = () =>
  typeof window !== "undefined" && !!(window as IntroWindow).__aetherIntroDone;
function markIntroDone() {
  if (isIntroDone()) return;
  (window as IntroWindow).__aetherIntroDone = true;
  window.dispatchEvent(new Event(EVENT));
}

/** True once the intro has finished (or was skipped) — use to start entrance animations. */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (isIntroDone()) {
      setDone(true);
      return;
    }
    const l = () => setDone(true);
    window.addEventListener(EVENT, l);
    return () => window.removeEventListener(EVENT, l);
  }, []);
  return done;
}

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* storage blocked */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setVisible(false);
      markIntroDone();
      return;
    }

    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);

    const start = performance.now();
    let raf = 0;
    let finishing = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed > 2800) loaded = true; // never hold the page hostage to slow images
      // time-based so slow devices don't stall the counter
      const eased = 1 - Math.pow(1 - Math.min(1, elapsed / 1900), 3);
      let value = eased * 100;
      if (!loaded) value = Math.min(value, 90);
      else if (eased >= 1) {
        if (!finishing) finishing = now;
        value = 100;
      }
      setPct(Math.floor(value));
      if (finishing) {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => {
          setVisible(false);
          setTimeout(markIntroDone, 350);
        }, 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    document.documentElement.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!visible) document.documentElement.style.overflow = "";
  }, [visible]);

  const ease = [0.76, 0, 0.24, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="preloader-failsafe fixed inset-0 z-[200] flex flex-col"
          exit={{ pointerEvents: "none" }}
          transition={{ duration: 1.2 }}
        >
          <motion.div
            className="relative flex-1 bg-background"
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease }}
          />
          <motion.div
            className="relative flex-1 bg-background"
            exit={{ y: "100%" }}
            transition={{ duration: 1.1, ease }}
          />

          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10"
            exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-between text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              <ScrambleText text="Aether Studio" trigger="mount" />
              <ScrambleText
                text="Zurich · Lisbon · Kyoto"
                trigger="mount"
                delay={0.2}
                className="hidden sm:inline"
              />
            </div>

            <div className="flex items-end justify-between gap-6">
              <span className="font-display text-[22vw] font-bold leading-[0.8] tracking-tighter tabular-nums md:text-[14vw]">
                {String(pct).padStart(3, "0")}
              </span>
              <div className="mb-3 w-1/3 max-w-xs">
                <div className="eyebrow mb-3 text-right">
                  <ScrambleText text="Calibrating light" trigger="mount" delay={0.35} />
                </div>
                <div className="h-px w-full bg-glass-border">
                  <div
                    className="h-px bg-accent transition-[width] duration-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
