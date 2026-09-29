import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Bookmark, BookmarkCheck, LayoutGrid, Rows3 } from "lucide-react";
import { toast } from "sonner";
import { CONCEPTS, CATEGORIES, type Concept } from "@/lib/concepts";
import { Reveal } from "@/components/site/Reveal";
import { ScrambleText } from "@/components/site/ScrambleText";
import { Magnetic } from "@/components/site/Magnetic";
import { Lightbox } from "@/components/site/Lightbox";
import { useBrief } from "@/lib/saved-concepts";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Aether Studio" },
      {
        name: "description",
        content:
          "Browse Aether Studio's architectural concepts and blueprints, and add them to a private project brief.",
      },
      { property: "og:title", content: "Portfolio — Aether Studio" },
      {
        property: "og:description",
        content: "Architectural concepts and blueprints you can save into a project brief.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const FEATURED = CONCEPTS[0]!;

function Portfolio() {
  const [filter, setFilter] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState<number | null>(null);
  const { has, toggle, slugs, setDrawerOpen } = useBrief();

  const shown = useMemo(
    () => (filter === "All" ? CONCEPTS : CONCEPTS.filter((c) => c.category === filter)),
    [filter],
  );

  const save = (c: Concept) => {
    const saved = has(c.slug);
    toggle(c.slug);
    toast[saved ? "message" : "success"](
      saved ? `${c.title} removed from brief` : `${c.title} added to brief`,
    );
  };

  return (
    <div className="-mt-24">
      <FeaturedHero
        concept={FEATURED}
        onOpen={() => {
          setFilter("All");
          setOpen(CONCEPTS.indexOf(FEATURED));
        }}
      />

      <div className="px-6 pb-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 pt-20">
            <Reveal>
              <p className="eyebrow">
                <ScrambleText text="Concepts & blueprints" />
              </p>
              <h1 className="display-lg mt-3">Portfolio</h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Open any project for the full story, then bookmark it to build a project brief. When
                you're ready, send it and a studio principal will reply with a feasibility note.
              </p>
            </Reveal>
            <div className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
              <span className="font-display text-5xl font-bold tabular-nums text-foreground">
                {String(shown.length).padStart(2, "0")}
              </span>{" "}
              projects
            </div>
          </div>

          {/* toolbar */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <div className="glass flex flex-wrap gap-1 rounded-full p-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={
                    "relative rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors " +
                    (filter === c
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {filter === c && (
                    <motion.span
                      layoutId="pf-filter"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="glass flex rounded-full p-1">
                {(
                  [
                    ["grid", LayoutGrid],
                    ["list", Rows3],
                  ] as const
                ).map(([v, Icon]) => (
                  <button
                    key={v}
                    aria-label={`${v} view`}
                    onClick={() => setView(v)}
                    className={
                      "relative flex h-8 w-9 items-center justify-center rounded-full transition-colors " +
                      (view === v
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {view === v && (
                      <motion.span
                        layoutId="pf-view"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="glass rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors hover:text-accent"
              >
                Brief · {slugs.length}
              </button>
            </div>
          </div>

          {view === "grid" ? (
            <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {shown.map((c, i) => (
                  <GridCard
                    key={c.slug}
                    c={c}
                    i={i}
                    saved={has(c.slug)}
                    onSave={() => save(c)}
                    onOpen={() => setOpen(i)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <ListView items={shown} onOpen={setOpen} has={has} onSave={save} />
          )}
        </div>
      </div>

      <Lightbox
        items={shown}
        index={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
        image={(c) => c.image}
        alt={(c) => `${c.title}, ${c.location}`}
        render={(c) => (
          <div className="flex h-full flex-col">
            <p className="eyebrow">
              {c.category} · {c.year}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-none md:text-4xl">
              {c.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.location}</p>
            <p className="mt-6 text-base leading-relaxed text-foreground/85">{c.blurb}</p>
            <dl className="mt-8 grid grid-cols-2 gap-3 text-xs">
              {[
                ["Category", c.category],
                ["Completed", c.year],
                ["Location", c.location.split(",")[0]],
                ["Status", Number(c.year) > 2025 ? "In progress" : "Built"],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-xl p-3">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1 text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              onClick={() => save(c)}
              className={
                "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs uppercase tracking-[0.18em] transition-colors md:mt-auto " +
                (has(c.slug)
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-85")
              }
            >
              {has(c.slug) ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              {has(c.slug) ? "Saved to brief" : "Add to brief"}
            </button>
          </div>
        )}
      />
    </div>
  );
}

/* Full-bleed featured project with scroll parallax and a glass info card. */
function FeaturedHero({ concept, onOpen }: { concept: Concept; onOpen: () => void }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const y = useTransform(p, [0, 1], ["0%", "25%"]);
  const scale = useTransform(p, [0, 1], [1.08, 1.2]);
  const radius = useTransform(p, [0, 1], [0, 40]);
  const inset = useTransform(p, [0, 1], ["inset(0% 0% 0% 0%)", "inset(6% 4% 0% 4%)"]);
  const titleY = useTransform(p, [0, 1], ["0%", "-40%"]);

  return (
    <section ref={ref} className="relative h-[92vh] min-h-[560px]">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: inset, borderRadius: radius }}
      >
        <motion.img
          src={concept.image}
          alt={`${concept.title}, ${concept.location}`}
          className="h-full w-full object-cover"
          style={{ y, scale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/50" />
      </motion.div>

      <motion.div
        style={{ y: titleY }}
        className="relative flex h-full flex-col justify-end px-6 pb-12 md:px-10 md:pb-16"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-8">
          <div>
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Featured · {concept.year}
            </motion.p>
            <h2 className="display-xl mt-4">
              {concept.title.split(" ").map((w, i) => (
                <span key={w} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.1, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: EASE }}
            className="glass-strong glass-spot max-w-sm rounded-2xl p-6"
          >
            <p className="text-sm text-muted-foreground">{concept.location}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{concept.blurb}</p>
            <Magnetic className="mt-5">
              <button
                onClick={onOpen}
                data-cursor="Open"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              >
                View project <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function GridCard({
  c,
  i,
  saved,
  onSave,
  onOpen,
}: {
  c: Concept;
  i: number;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.06, ease: EASE }}
      className="group"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({
            x: ((e.clientY - r.top) / r.height - 0.5) * -7,
            y: ((e.clientX - r.left) / r.width - 0.5) * 7,
          });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl"
      >
        <button
          onClick={onOpen}
          data-cursor="Open"
          className="absolute inset-0 block"
          aria-label={`Open ${c.title}`}
        >
          <img
            src={c.image}
            alt={`${c.title}, ${c.location}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        </button>

        <span className="glass-strong pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em]">
          {String(i + 1).padStart(2, "0")} — {c.category}
        </span>
        <button
          onClick={onSave}
          aria-label={saved ? "Remove from brief" : "Add to brief"}
          className={
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 " +
            (saved ? "bg-accent text-accent-foreground" : "glass-strong hover:scale-110")
          }
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>

        <div className="glass-strong pointer-events-none absolute inset-x-3 bottom-3 rounded-xl p-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-bold uppercase">{c.title}</h2>
            <span className="font-mono text-xs text-muted-foreground">{c.year}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.location}</p>
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]">
            <p className="overflow-hidden text-sm leading-relaxed text-foreground/80">
              <span className="block pt-3">{c.blurb}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

/* Editorial list: rows of titles; the hovered row's photo floats beside the cursor. */
function ListView({
  items,
  onOpen,
  has,
  onSave,
}: {
  items: Concept[];
  onOpen: (i: number) => void;
  has: (slug: string) => boolean;
  onSave: (c: Concept) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative mt-10"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ul className="glass overflow-hidden rounded-2xl">
        {items.map((c, i) => (
          <motion.li
            key={c.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: i * 0.04, ease: EASE }}
            onPointerEnter={() => setHover(i)}
            className="group border-b border-glass-border last:border-0"
          >
            <div className="flex items-center gap-4 px-5 py-5 transition-colors duration-300 group-hover:bg-foreground/[0.04] md:px-8 md:py-7">
              <span className="w-8 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <button onClick={() => onOpen(i)} data-cursor="Open" className="flex-1 text-left">
                <span className="block font-display text-2xl font-bold uppercase transition-transform duration-500 group-hover:translate-x-3 md:text-4xl">
                  {c.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground md:hidden">
                  {c.location} · {c.year}
                </span>
              </button>
              <span className="hidden w-40 text-sm text-muted-foreground md:block">
                {c.location.split(",")[0]}
              </span>
              <span className="hidden w-28 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:block">
                {c.category}
              </span>
              <span className="hidden w-12 font-mono text-xs text-muted-foreground md:block">
                {c.year}
              </span>
              <button
                onClick={() => onSave(c)}
                aria-label={has(c.slug) ? "Remove from brief" : "Add to brief"}
                className={
                  "flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-colors " +
                  (has(c.slug)
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-glass-border hover:bg-secondary")
                }
              >
                {has(c.slug) ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {hover !== null && items[hover] && (
          <motion.div
            key="preview"
            className="pointer-events-none absolute left-0 top-0 z-20 hidden h-56 w-72 overflow-hidden rounded-2xl shadow-2xl lg:block"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, x: pos.x + 40, y: pos.y - 110 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.6 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={items[hover].slug}
                src={items[hover].image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
