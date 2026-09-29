import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { CONCEPTS, CATEGORIES } from "@/lib/concepts";
import { Reveal } from "@/components/site/Reveal";
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

function Portfolio() {
  const [filter, setFilter] = useState<string>("All");
  const { has, toggle, slugs, setDrawerOpen } = useBrief();

  const shown = useMemo(
    () => (filter === "All" ? CONCEPTS : CONCEPTS.filter((c) => c.category === filter)),
    [filter],
  );

  return (
    <div className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="eyebrow">Concepts & blueprints</p>
          <h1 className="display-lg mt-3">Portfolio</h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bookmark any concept to build a project brief. When you're ready, submit it and
            our studio will respond with a feasibility note.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
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
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-full border border-glass-border px-4 py-1.5 text-xs uppercase tracking-[0.16em] hover:bg-secondary"
          >
            Brief · {slugs.length}
          </button>
        </div>

        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => {
            const saved = has(c.slug);
            return (
              <motion.article
                layout
                key={c.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group glass flex flex-col overflow-hidden"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                    {c.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-lg font-bold uppercase">{c.title}</h2>
                    <span className="text-xs text-muted-foreground">{c.year}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>

                  <button
                    onClick={() => {
                      toggle(c.slug);
                      toast[saved ? "message" : "success"](
                        saved ? `${c.title} removed from brief` : `${c.title} added to brief`,
                      );
                    }}
                    className={
                      "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors " +
                      (saved
                        ? "bg-accent text-accent-foreground"
                        : "border border-glass-border hover:bg-secondary")
                    }
                  >
                    {saved ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5" /> Add to brief
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
