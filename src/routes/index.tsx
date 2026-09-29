import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight, ArrowUpRight, Move3d } from "lucide-react";
import { CONCEPTS, CATEGORIES, type Concept } from "@/lib/concepts";
import { Reveal } from "@/components/site/Reveal";
import { ScrambleText } from "@/components/site/ScrambleText";
import { Magnetic } from "@/components/site/Magnetic";
import { VelocityMarquee } from "@/components/site/VelocityMarquee";
import { ScrollHud } from "@/components/site/ScrollHud";
import { useIntroDone } from "@/components/site/Preloader";
import { Gallery, Horizon } from "@/components/site/HomeImagery";
import { CTA_BACKDROP } from "@/lib/imagery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aether Studio — Ultra-Luxury Architecture" },
      {
        name: "description",
        content:
          "Aether Studio designs ultra-luxury architecture across Europe and Asia — monolithic houses, cultural pavilions and vertical urban landscapes.",
      },
      { property: "og:title", content: "Aether Studio — Ultra-Luxury Architecture" },
      {
        property: "og:description",
        content: "Monolithic houses, cultural pavilions and vertical urban landscapes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const PROCESS = [
  {
    n: "01",
    t: "Site Reading",
    d: "Twelve weeks of light studies, geology and local craft surveys.",
  },
  { n: "02", t: "Massing", d: "Physical models at 1:200 before a single digital line is drawn." },
  {
    n: "03",
    t: "Material Trials",
    d: "Full-scale mock-ups cast, weathered and rejected until one holds.",
  },
  { n: "04", t: "Detailing", d: "Every junction drawn at 1:1. No standard components." },
  { n: "05", t: "Construction", d: "A studio architect resident on site for the full build." },
  { n: "06", t: "Afterlife", d: "We revisit at year one, five and ten to record how it ages." },
];

function Home() {
  return (
    <div className="-mt-24">
      <ScrollHud />
      <Hero />
      <VelocityMarquee
        className="hairline border-b border-glass-border py-6 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl"
        items={[
          "Monolithic houses",
          "Cultural pavilions",
          "Vertical landscapes",
          "Cast once",
          "Built to age",
        ]}
      />
      <Horizon />
      <Showcase />
      <Manifesto />
      <Process />
      <BlueprintViewer />
      <Gallery />
      <CTA />
    </div>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function useClock(tz: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);
  return time;
}

function HeroLetter({
  ch,
  i,
  total,
  line,
  progress,
  ready,
}: {
  ch: string;
  i: number;
  total: number;
  line: number;
  progress: MotionValue<number>;
  ready: boolean;
}) {
  // letters peel away at different speeds as you scroll out of the hero
  const spread = (i - (total - 1) / 2) / total;
  const speed = 0.6 + ((i * 7 + line * 3) % 5) * 0.28;
  const y = useTransform(progress, [0, 1], ["0%", `${-120 * speed}%`]);
  const x = useTransform(progress, [0, 1], ["0%", `${spread * 90}%`]);
  const rotate = useTransform(progress, [0, 1], [0, spread * 28]);
  const blur = useTransform(progress, [0, 0.7], [0, 14]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const opacity = useTransform(progress, [0.2, 0.8], [1, 0]);

  return (
    <motion.span className="inline-block" style={{ y, x, rotate, filter, opacity }}>
      <span className="inline-block overflow-hidden -mb-[0.14em] pb-[0.14em] align-bottom">
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          animate={ready ? { y: "0%" } : { y: "110%" }}
          transition={{ duration: 1.2, delay: 0.05 + line * 0.12 + i * 0.045, ease: EASE }}
        >
          {ch}
        </motion.span>
      </span>
    </motion.span>
  );
}

function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const ready = useIntroDone();
  const time = useClock("Europe/Zurich");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const subY = useTransform(progress, [0, 1], ["0%", "-60%"]);
  const subOpacity = useTransform(progress, [0, 0.45], [1, 0]);
  const cueOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const lines = ["Aether", "Studio"];

  return (
    <section ref={ref} data-section="Index" data-scene="0" className="relative h-[175vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden px-6 pb-10 pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow">
            {ready && <ScrambleText text="Zurich · Lisbon · Kyoto — est. 2009" trigger="mount" />}
          </p>
          <div className="hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.24em] text-muted-foreground md:block">
            <div>47.3769° N · 8.5417° E</div>
            <div className="tabular-nums text-foreground">ZRH {time || "--:--:--"}</div>
          </div>
        </div>

        <div>
          <h1 className="display-xl select-none" aria-label="Aether Studio">
            {lines.map((word, l) => (
              <span key={word} className="block whitespace-nowrap" aria-hidden>
                {word.split("").map((ch, i) => (
                  <HeroLetter
                    key={i}
                    ch={ch}
                    i={i}
                    total={word.length}
                    line={l}
                    progress={progress}
                    ready={ready}
                  />
                ))}
              </span>
            ))}
          </h1>

          <motion.div
            style={{ y: subY, opacity: subOpacity }}
            className="mt-10 grid gap-8 md:grid-cols-12 md:items-end"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="flex flex-wrap items-center gap-3 md:col-span-6"
            >
              <Magnetic>
                <Link
                  to="/portfolio"
                  data-cursor="Enter"
                  className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
                >
                  View portfolio
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full border border-glass-border px-6 py-3 text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-colors hover:bg-secondary"
                >
                  Commission a project
                </Link>
              </Magnetic>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: 0.55, duration: 1.1, ease: EASE }}
              className="glass glass-spot rounded-2xl p-6 text-base leading-relaxed text-foreground/75 md:col-span-5 md:col-start-8"
            >
              We build few things, slowly. Each project is a negotiation between a site, a material
              and a century — resolved at full scale before anything is poured.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        >
          <span className="eyebrow">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-glass-border">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-foreground" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Showcase ─────────────────────────── */

function WorkCard({ c, i }: { c: Concept; i: number }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const cardY = useTransform(
    scrollYProgress,
    [0, 1],
    [i % 3 === 1 ? 80 : 30, i % 3 === 1 ? -80 : -30],
  );
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="group"
    >
      <motion.div style={{ y: cardY }}>
        <Link to="/portfolio" className="block" data-cursor="View">
          <motion.div
            className="relative aspect-4/5 overflow-hidden rounded-2xl"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.3, delay: (i % 3) * 0.08, ease: [0.76, 0, 0.24, 1] }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setTilt({
                x: ((e.clientY - r.top) / r.height - 0.5) * -6,
                y: ((e.clientX - r.left) / r.width - 0.5) * 6,
              });
            }}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ perspective: 900 }}
          >
            <motion.div
              className="absolute inset-[-12%]"
              style={{ y: imgY }}
              animate={{ rotateX: tilt.x, rotateY: tilt.y }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-[1400ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-40" />
            <span className="glass-strong absolute left-3 top-3 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/80">
              {String(i + 1).padStart(2, "0")} — {c.category}
            </span>
            <span className="glass-strong absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
            </span>
            <div className="glass-strong absolute inset-x-3 bottom-3 rounded-xl px-4 py-3.5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-lg font-bold uppercase">{c.title}</h3>
                <span className="font-mono text-xs text-muted-foreground">{c.year}</span>
              </div>
              <div className="relative mt-1.5 h-px w-full overflow-hidden bg-glass-border">
                <span className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{c.location}</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.article>
  );
}

function Showcase() {
  const [filter, setFilter] = useState<string>("All");
  const shown = useMemo(
    () => (filter === "All" ? CONCEPTS : CONCEPTS.filter((c) => c.category === filter)).slice(0, 6),
    [filter],
  );

  return (
    <section data-section="Work" data-scene="1" className="px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">
              <ScrambleText text="Selected work — 2019 / 2026" />
            </p>
            <h2 className="display-lg mt-3">
              <ScrambleText text="Selected Work" duration={1.1} />
            </h2>
          </div>
          <Reveal className="glass flex flex-wrap gap-1 rounded-full p-1" delay={0.2}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={
                  "relative rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors " +
                  (filter === c
                    ? "border-transparent text-primary-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {filter === c && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </Reveal>
        </div>

        <motion.div layout className="mt-16 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((c, i) => (
              <WorkCard key={c.slug} c={c} i={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Manifesto ─────────────────────────── */

const MANIFESTO =
  "Architecture is the slowest medium we know. We design for the hundredth winter, not the first photograph — mass, shadow and silence, cast once and left to age.";

function Word({
  w,
  range,
  progress,
}: {
  w: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  const accent = /hundredth|silence/.test(w);
  return (
    <motion.span
      style={{ opacity, y }}
      className={"mr-[0.25em] inline-block " + (accent ? "text-accent" : "")}
    >
      {w}
    </motion.span>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

function Manifesto() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const words = MANIFESTO.split(" ");

  return (
    <section
      ref={ref}
      data-section="Ethos"
      data-scene="1.5"
      className="hairline px-6 py-32 md:px-10 md:py-44"
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">
          <ScrambleText text="Ethos" />
        </p>
        <p className="mt-8 font-display text-[clamp(1.75rem,4.6vw,4rem)] font-bold uppercase leading-[1.02] tracking-[-0.035em]">
          {words.map((w, i) => {
            const start = (i / words.length) * 0.85;
            return <Word key={i} w={w} progress={scrollYProgress} range={[start, start + 0.15]} />;
          })}
        </p>

        <div className="mt-24 grid grid-cols-2 gap-10 md:grid-cols-4">
          {[
            { v: 17, s: "", l: "Years in practice" },
            { v: 42, s: "", l: "Buildings completed" },
            { v: 3, s: "", l: "Commissions a year" },
            { v: 100, s: "+", l: "Year design life" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08} className="glass glass-spot rounded-2xl p-6">
              <div className="font-display text-5xl font-bold md:text-6xl">
                <Counter to={s.v} suffix={s.s} />
              </div>
              <div className="eyebrow mt-3">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Process ─────────────────────────── */

function ProcessCard({
  s,
  i,
  progress,
}: {
  s: (typeof PROCESS)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const center = i / (PROCESS.length - 1);
  const dist = useTransform(progress, (p) => Math.min(1, Math.abs(p - center) * 2.2));
  const scale = useTransform(dist, [0, 1], [1, 0.9]);
  const opacity = useTransform(dist, [0, 1], [1, 0.4]);
  const rotateY = useTransform(progress, (p) => Math.max(-18, Math.min(18, (center - p) * 40)));

  return (
    <motion.div
      style={{ scale, opacity, rotateY }}
      className="glass glass-spot relative flex h-72 w-[78vw] rounded-2xl flex-none flex-col justify-between overflow-hidden p-7 sm:w-[46vw] lg:w-[30vw]"
    >
      <span className="pointer-events-none absolute -right-4 -top-8 font-display text-[9rem] font-bold leading-none text-foreground/[0.04]">
        {s.n}
      </span>
      <span className="font-mono text-xs tracking-[0.3em] text-accent">{s.n} / 06</span>
      <div>
        <h3 className="font-display text-2xl font-bold uppercase">{s.t}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
      </div>
    </motion.div>
  );
}

function Process() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.35 });
  const x = useTransform(progress, [0, 1], ["4%", "-64%"]);
  const titleX = useTransform(progress, [0, 1], ["0%", "18%"]);
  const [step, setStep] = useState(1);
  useMotionValueEvent(progress, "change", (p) =>
    setStep(Math.min(PROCESS.length, Math.max(1, Math.round(p * (PROCESS.length - 1)) + 1))),
  );

  return (
    <section
      ref={ref}
      data-section="Process"
      data-scene="2"
      className="hairline relative h-[320vh]"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="flex items-end justify-between gap-6 px-6 md:px-10">
          <div>
            <p className="eyebrow">
              <ScrambleText text="How we work" />
            </p>
            <motion.h2 style={{ x: titleX }} className="display-lg mt-3">
              The Process
            </motion.h2>
          </div>
          <div className="text-right font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            <div className="font-display text-4xl font-bold tabular-nums text-foreground md:text-6xl">
              {String(step).padStart(2, "0")}
            </div>
            <div className="mt-1">of 06</div>
          </div>
        </div>
        <motion.div style={{ x, perspective: 1200 }} className="mt-12 flex gap-6 px-6 md:px-10">
          {PROCESS.map((s, i) => (
            <ProcessCard key={s.n} s={s} i={i} progress={progress} />
          ))}
        </motion.div>
        <div className="mx-6 mt-12 h-px bg-glass-border md:mx-10">
          <motion.div className="h-px origin-left bg-accent" style={{ scaleX: progress }} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Blueprint ────────────────────────── */

function BlueprintViewer() {
  const [rot, setRot] = useState({ x: -12, y: 18 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  return (
    <section
      data-section="Blueprint"
      data-scene="3"
      className="hairline px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-4">
          <p className="eyebrow">
            <ScrambleText text="Interactive" />
          </p>
          <h2 className="display-lg mt-3">
            <ScrambleText text="Blueprint Viewer" duration={1.1} />
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Drag to rotate the plan, scroll or use the slider to zoom. This is the same live drawing
            model our clients receive during design development.
          </p>
          <div className="mt-8">
            <label className="eyebrow" htmlFor="zoom">
              Zoom · <span className="font-mono tabular-nums">{zoom.toFixed(2)}×</span>
            </label>
            <input
              id="zoom"
              type="range"
              min={0.6}
              max={1.8}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--accent)]"
            />
          </div>
          <button
            onClick={() => {
              setRot({ x: -12, y: 18 });
              setZoom(1);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border px-5 py-2 text-xs uppercase tracking-[0.18em] hover:bg-secondary"
          >
            <Move3d className="h-3.5 w-3.5" /> Reset view
          </button>
        </Reveal>

        <Reveal className="min-w-0 lg:col-span-8" delay={0.15}>
          <div
            data-lenis-prevent
            data-cursor="Drag"
            className="glass glass-spot relative flex h-[420px] cursor-grab rounded-2xl items-center justify-center overflow-hidden select-none active:cursor-grabbing md:h-[520px]"
            style={{ perspective: "1200px" }}
            onPointerDown={(e) => {
              dragging.current = true;
              last.current = { x: e.clientX, y: e.clientY };
              (e.target as Element).setPointerCapture?.(e.pointerId);
            }}
            onPointerUp={() => (dragging.current = false)}
            onPointerLeave={() => (dragging.current = false)}
            onPointerMove={(e) => {
              if (!dragging.current) return;
              const dx = e.clientX - last.current.x;
              const dy = e.clientY - last.current.y;
              last.current = { x: e.clientX, y: e.clientY };
              setRot((r) => ({
                x: Math.max(-70, Math.min(40, r.x - dy * 0.3)),
                y: r.y + dx * 0.3,
              }));
            }}
            onWheel={(e) => setZoom((z) => Math.max(0.6, Math.min(1.8, z - e.deltaY * 0.0012)))}
          >
            <div className="scanline pointer-events-none absolute inset-0" />
            <div
              style={{
                transform: `rotateX(${rot.x}deg) rotateZ(${rot.y}deg) scale(${zoom})`,
                transformStyle: "preserve-3d",
                transition: dragging.current ? "none" : "transform 0.25s ease-out",
              }}
            >
              <BlueprintSvg />
            </div>
            <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Monolith House · Level 00 · 1:200
            </span>
            <span className="absolute right-5 top-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground tabular-nums">
              RX {rot.x.toFixed(0)}° · RZ {(((rot.y % 360) + 360) % 360).toFixed(0)}°
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BlueprintSvg() {
  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-15% 0px" },
    transition: { duration: 1.6, delay, ease: [0.65, 0, 0.35, 1] as const },
  });
  return (
    <svg
      viewBox="0 0 460 360"
      fill="none"
      aria-label="Floor plan"
      className="h-auto w-[min(460px,78vw)]"
    >
      <g stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="0.5">
        {Array.from({ length: 19 }).map((_, i) => (
          <motion.line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={360} {...draw(i * 0.02)} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.line key={`h${i}`} x1={0} y1={i * 25} x2={460} y2={i * 25} {...draw(i * 0.02)} />
        ))}
      </g>
      <g stroke="var(--foreground)" strokeWidth="2" fill="none">
        <motion.rect x="40" y="40" width="380" height="280" {...draw(0.4)} />
        <motion.rect x="40" y="40" width="180" height="150" {...draw(0.7)} />
        <motion.rect x="220" y="190" width="200" height="130" {...draw(0.8)} />
        <motion.line x1="220" y1="40" x2="220" y2="320" {...draw(0.9)} />
        <motion.line x1="40" y1="190" x2="420" y2="190" {...draw(1)} />
        <motion.circle cx="130" cy="255" r="42" {...draw(1.1)} />
        <motion.path d="M300 40 v40 a40 40 0 0 0 40 40 h40" {...draw(1.2)} />
      </g>
      <g stroke="var(--accent)" strokeWidth="1.5" fill="none">
        <motion.line x1="40" y1="340" x2="420" y2="340" {...draw(1.4)} />
        <line x1="40" y1="334" x2="40" y2="346" />
        <line x1="420" y1="334" x2="420" y2="346" />
      </g>
    </svg>
  );
}

/* ───────────────────────────── CTA ───────────────────────────── */

function CTA() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const fill = useTransform(scrollYProgress, [0.25, 0.9], [100, 0]);
  const clip = useTransform(fill, (f) => `inset(0 ${f}% 0 0)`);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-18%", "0%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1.05]);

  return (
    <section
      ref={ref}
      data-section="Commission"
      data-scene="4"
      className="relative isolate overflow-hidden px-4 py-28 md:px-10 md:py-40"
    >
      <motion.div aria-hidden className="absolute inset-0 -z-10" style={{ y: bgY, scale: bgScale }}>
        <img src={CTA_BACKDROP} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/55 to-background"
      />

      <motion.div
        style={{ scale }}
        className="glass-strong glass-spot mx-auto max-w-6xl rounded-[2rem] px-6 py-16 text-center md:px-16 md:py-24"
      >
        <p className="eyebrow">
          <ScrambleText text="Three commissions a year" />
        </p>
        <h2 className="relative mt-6 font-display text-[clamp(2.5rem,9vw,8.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em]">
          <span
            className="block text-transparent [-webkit-text-stroke:1px_oklch(1_0_0/35%)]"
            aria-hidden
          >
            Begin a<br />
            commission
          </span>
          <motion.span className="absolute inset-0 block" style={{ clipPath: clip }}>
            Begin a<br />
            commission
          </motion.span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-sm text-foreground/75">
          We accept three new projects each year. Tell us about the site.
        </p>
        <Magnetic strength={0.5} className="mt-12">
          <Link
            to="/contact"
            data-cursor="Write"
            className="group relative inline-flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-accent text-[11px] uppercase tracking-[0.2em] text-accent-foreground shadow-[0_20px_60px_-15px_oklch(0.78_0.09_72/60%)] md:h-40 md:w-40"
          >
            <span className="absolute inset-0 translate-y-full rounded-full bg-primary transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative flex items-center gap-2">
              Contact{" "}
              <ArrowRight className="h-3.5 w-3.5 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
            </span>
          </Link>
        </Magnetic>
      </motion.div>
    </section>
  );
}
