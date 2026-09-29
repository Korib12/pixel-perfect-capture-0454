import { useEffect, useRef, useState, type ElementType } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*+=_";

type Props = {
  text: string;
  className?: string;
  as?: ElementType;
  /** "view" scrambles when scrolled into view, "mount" right away. */
  trigger?: "view" | "mount";
  delay?: number;
  /** seconds for the whole string to resolve */
  duration?: number;
  /** re-scramble on hover */
  hover?: boolean;
};

const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;

/**
 * Decoding text effect: characters cycle through glyphs and lock into place
 * left to right. Screen readers get the real text via aria-label.
 */
export function ScrambleText({
  text,
  className,
  as: Tag = "span",
  trigger = "view",
  delay = 0,
  duration = 0.9,
  hover = false,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [out, setOut] = useState(text);
  const [armed, setArmed] = useState(false);
  const raf = useRef(0);

  const run = (wait = delay) => {
    cancelAnimationFrame(raf.current);
    const start = performance.now() + wait * 1000;
    const total = duration * 1000;
    let lastSwap = 0;
    const step = (now: number) => {
      const t = Math.max(0, now - start) / total;
      if (now - lastSwap > 45 || t >= 1) {
        lastSwap = now;
        const locked = Math.floor(t * text.length * 1.15);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]!;
          if (ch === " " || ch === "·" || i < locked) s += ch;
          else s += now < start ? " " : rand();
        }
        setOut(s);
        if (now >= start) setArmed(false);
      }
      if (t < 1) raf.current = requestAnimationFrame(step);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    if (trigger === "mount") {
      setArmed(true);
      run();
      return () => cancelAnimationFrame(raf.current);
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setArmed(true);
      run();
      return () => cancelAnimationFrame(raf.current);
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag
      ref={ref}
      aria-label={text}
      className={className}
      onMouseEnter={hover ? () => run(0) : undefined}
    >
      <span aria-hidden style={{ opacity: armed ? 0 : 1, transition: "opacity 0.2s" }}>
        {out}
      </span>
    </Tag>
  );
}
