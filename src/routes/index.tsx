import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Move3d } from "lucide-react";
import { CONCEPTS, CATEGORIES } from "@/lib/concepts";
import { Reveal, StaggerLines } from "@/components/site/Reveal";

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

const PROCESS = [
  { n: "01", t: "Site Reading", d: "Twelve weeks of light studies, geology and local craft surveys." },
  { n: "02", t: "Massing", d: "Physical models at 1:200 before a single digital line is drawn." },
  { n: "03", t: "Material Trials", d: "Full-scale mock-ups cast, weathered and rejected until one holds." },
  { n: "04", t: "Detailing", d: "Every junction drawn at 1:1. No standard components." },
  { n: "05", t: "Construction", d: "A studio architect resident on site for the full build." },
  { n: "06", t: "Afterlife", d: "We revisit at year one, five and ten to record how it ages." },
];

function Home() {
  return (
    <div>
      <Hero />
      <Showcase />
      <Process />
      <BlueprintViewer />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pb-28 pt-16 md:px-10 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          Zurich · Lisbon · Kyoto — est. 2009
        </motion.p>

        <h1 className="display-xl mt-6">
          <StaggerLines lines={["Aether", "Studio"]} />
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <motion.p
            className="text-base leading-relaxed text-muted-foreground md:col-span-5 md:col-start-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            We build few things, slowly. Each project is a negotiation between a site, a
            material and a century — resolved at full scale before anything is poured.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-14 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/portfolio"
            className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
          >
            View portfolio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full border border-glass-border px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-secondary"
          >
            Commission a project
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Showcase() {
  const [filter, setFilter] = useState<string>("All");
  const shown = useMemo(
    () => (filter === "All" ? CONCEPTS : CONCEPTS.filter((c) => c.category === filter)).slice(0, 6),
    [filter],
  );

  return (
    <section className="hairline px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-lg">Selected Work</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={
                  "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors " +
                  (filter === c
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-glass-border text-muted-foreground hover:text-foreground")
                }
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => (
            <motion.article
              key={c.slug}
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <Link to="/portfolio" className="block">
                <div className="relative aspect-4/5 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/10 transition-opacity group-hover:opacity-0" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg font-bold uppercase">{c.title}</h3>
                  <span className="text-xs text-muted-foreground">{c.year}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Process() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section ref={ref} className="hairline relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-10">
          <p className="eyebrow">How we work</p>
          <h2 className="display-lg mt-3">The Process</h2>
        </div>
        <motion.div style={{ x }} className="mt-12 flex gap-6 px-6 md:px-10">
          {PROCESS.map((s) => (
            <div
              key={s.n}
              className="glass flex h-64 w-[78vw] flex-none flex-col justify-between p-7 sm:w-[46vw] lg:w-[30vw]"
            >
              <span className="font-display text-5xl font-bold text-muted-foreground">{s.n}</span>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BlueprintViewer() {
  const [rot, setRot] = useState({ x: -12, y: 18 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  return (
    <section className="hairline px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow">Interactive</p>
          <h2 className="display-lg mt-3">Blueprint Viewer</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Drag to rotate the plan, scroll or use the slider to zoom. This is the same
            live drawing model our clients receive during design development.
          </p>
          <div className="mt-8">
            <label className="eyebrow" htmlFor="zoom">
              Zoom
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

        <div className="lg:col-span-8">
          <div
            className="glass relative flex h-[420px] items-center justify-center overflow-hidden select-none md:h-[520px]"
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
            <div
              style={{
                transform: `rotateX(${rot.x}deg) rotateZ(${rot.y}deg) scale(${zoom})`,
                transformStyle: "preserve-3d",
                transition: dragging.current ? "none" : "transform 0.25s ease-out",
              }}
            >
              <BlueprintSvg />
            </div>
            <span className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Monolith House · Level 00 · 1:200
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlueprintSvg() {
  return (
    <svg width="460" height="360" viewBox="0 0 460 360" fill="none" aria-label="Floor plan">
      <g stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="0.5">
        {Array.from({ length: 19 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={360} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 25} x2={460} y2={i * 25} />
        ))}
      </g>
      <g stroke="var(--foreground)" strokeWidth="2" fill="none">
        <rect x="40" y="40" width="380" height="280" />
        <rect x="40" y="40" width="180" height="150" />
        <rect x="220" y="190" width="200" height="130" />
        <line x1="220" y1="40" x2="220" y2="320" />
        <line x1="40" y1="190" x2="420" y2="190" />
        <circle cx="130" cy="255" r="42" />
        <path d="M300 40 v40 a40 40 0 0 0 40 40 h40" />
      </g>
      <g stroke="var(--accent)" strokeWidth="1.5" fill="none">
        <line x1="40" y1="340" x2="420" y2="340" />
        <line x1="40" y1="334" x2="40" y2="346" />
        <line x1="420" y1="334" x2="420" y2="346" />
      </g>
    </svg>
  );
}

function CTA() {
  return (
    <section className="hairline px-6 py-28 md:px-10">
      <Reveal className="mx-auto max-w-4xl text-center">
        <h2 className="display-lg">Begin a commission</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
          We accept three new projects each year. Tell us about the site.
        </p>
        <Link
          to="/contact"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          Contact the studio <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Reveal>
    </section>
  );
}
