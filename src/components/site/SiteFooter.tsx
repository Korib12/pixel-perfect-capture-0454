import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useLenis } from "@/lib/smooth-scroll";
import { Magnetic } from "./Magnetic";

/** Number of prompts it took to build the site — update as you go. */
export const PROMPT_COUNT = 11;

const NAV = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
  { to: "/portal", label: "Client Portal" },
] as const;

const BUILT_WITH = [
  { label: "Lovable", href: "https://lovable.dev" },
  { label: "Claude", href: "https://claude.ai" },
  { label: "GitHub", href: "https://github.com/Korib12/pixel-perfect-capture-0454" },
];

const INSPIRATION = [
  { label: "ArchDaily", href: "https://www.archdaily.com" },
  { label: "Dezeen", href: "https://www.dezeen.com" },
  { label: "designboom", href: "https://www.designboom.com" },
  { label: "Zaha Hadid Architects", href: "https://www.zaha-hadid.com" },
  { label: "Igloo Inc", href: "https://www.igloo.inc" },
];

function Count({ to, pad = 2 }: { to: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setV(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {String(v).padStart(pad, "0")}
    </span>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="roll">
        <span>{label}</span>
        <span aria-hidden>{label}</span>
      </span>
      <ArrowUpRight className="h-3 w-3 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
    </a>
  );
}

export function SiteFooter() {
  const lenis = useLenis();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["35%", "0%"]);
  const wordOpacity = useTransform(scrollYProgress, [0.3, 1], [0.15, 1]);
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={ref} className="relative mt-32 overflow-hidden px-4 pb-6 pt-10 md:px-6">
      <div className="glass-strong glass-spot relative mx-auto max-w-[1600px] overflow-hidden rounded-[2rem] px-6 pb-6 pt-12 md:px-12 md:pt-16">
        {/* colophon: how this site was made */}
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Colophon</p>
            <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-[0.95] tracking-[-0.03em] md:text-5xl">
              How this
              <br />
              site was made
            </h3>
            <ul className="mt-8 space-y-3 text-base leading-relaxed text-foreground/85">
              <li className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 flex-none rotate-45 bg-accent" />I built this
                site in a few hours.
              </li>
              <li className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 flex-none rotate-45 bg-accent" />I used Lovable,
                Claude and GitHub to build this site.
              </li>
              <li className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 flex-none rotate-45 bg-accent" />
                It took me {PROMPT_COUNT} prompts to create this site.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3 self-end lg:col-span-7">
            {[
              { n: <>Few</>, l: "Hours" },
              { n: <Count to={3} />, l: "Tools" },
              { n: <Count to={PROMPT_COUNT} />, l: "Prompts" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4 md:p-6">
                <div className="font-display text-3xl font-bold sm:text-4xl md:text-7xl">{s.n}</div>
                <div className="eyebrow mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline mt-14 grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="group text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="roll">
                      <span>{n.label}</span>
                      <span aria-hidden>{n.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Built with</p>
            <ul className="mt-4 space-y-2.5">
              {BUILT_WITH.map((l) => (
                <li key={l.label}>
                  <ExtLink {...l} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Inspiration</p>
            <ul className="mt-4 space-y-2.5">
              {INSPIRATION.map((l) => (
                <li key={l.label}>
                  <ExtLink {...l} />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="eyebrow">Studio</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Zurich · Lisbon · Kyoto
                <br />
                Mon–Fri, 09:00–18:00 CET
              </p>
            </div>
            <Magnetic>
              <button
                onClick={toTop}
                data-cursor="Top"
                className="group glass flex h-14 w-14 items-center justify-center rounded-full transition-colors hover:text-accent"
                aria-label="Back to top"
              >
                <ArrowUp className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-1" />
              </button>
            </Magnetic>
          </div>
        </div>

        {/* giant wordmark rising out of the bottom edge */}
        <motion.div
          aria-hidden
          style={{ y: wordY, opacity: wordOpacity }}
          className="pointer-events-none mt-10 select-none text-center font-display text-[22vw] font-bold uppercase leading-[0.72] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_oklch(1_0_0/22%)] xl:text-[300px]"
        >
          <span className="bg-gradient-to-b from-foreground/20 via-foreground/5 to-transparent bg-clip-text">
            Aether
          </span>
        </motion.div>

        <div className="relative mt-4 flex flex-col gap-2 border-t border-glass-border pt-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {year ?? ""} Aether Studio · A student project</span>
          <span className="font-mono uppercase tracking-[0.24em]">Thanks for scrolling</span>
        </div>
      </div>
    </footer>
  );
}
