import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ScrambleText } from "./ScrambleText";
import { GALLERY, HORIZON, type Photo } from "@/lib/imagery";

/**
 * Pinned full-screen reveal: the photo opens from a small framed window to
 * full bleed as you scroll, while a headline splits across it and glass
 * caption cards float in.
 */
export function Horizon() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });

  const inset = useTransform(p, [0, 0.55], [1, 0]);
  const clipPath = useTransform(inset, (t) => {
    const v = 18 * t;
    const h = 30 * t;
    return `inset(${v}% ${h}% ${v}% ${h}% round ${28 * t + 0.001}px)`;
  });
  const imgScale = useTransform(p, [0, 1], [1.35, 1.02]);
  const shade = useTransform(p, [0.15, 0.6], [0, 1]);
  const leftX = useTransform(p, [0, 0.55], ["-18vw", "0vw"]);
  const rightX = useTransform(p, [0, 0.55], ["18vw", "0vw"]);
  const headOpacity = useTransform(p, [0.05, 0.3, 0.85, 1], [0, 1, 1, 0.3]);
  const cardY = useTransform(p, [0.5, 0.75], [60, 0]);
  const cardOpacity = useTransform(p, [0.5, 0.72], [0, 1]);

  return (
    <section ref={ref} data-section="Horizon" data-scene="0.6" className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0 will-change-[clip-path]" style={{ clipPath }}>
          <motion.img
            src={HORIZON.src}
            alt={`${HORIZON.title} — ${HORIZON.place}`}
            className="h-full w-full object-cover"
            style={{ scale: imgScale }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-background/35"
            style={{ opacity: shade }}
          />
        </motion.div>

        <motion.h2
          style={{ opacity: headOpacity }}
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 font-display text-[clamp(2.5rem,9vw,8.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em] text-foreground [text-shadow:0_10px_60px_oklch(0_0_0/45%)] md:px-10"
        >
          <motion.span className="block" style={{ x: leftX }}>
            Shaped by
          </motion.span>
          <motion.span className="block text-right" style={{ x: rightX }}>
            light
          </motion.span>
        </motion.h2>

        <motion.div
          style={{ y: cardY, opacity: cardOpacity }}
          className="glass-strong glass-spot absolute bottom-8 left-6 max-w-sm rounded-2xl p-6 md:bottom-12 md:left-10"
        >
          <p className="eyebrow">Reference</p>
          <h3 className="mt-2 font-display text-2xl font-bold uppercase">{HORIZON.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{HORIZON.place}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            The benchmark we keep returning to: one continuous surface that rises from the plaza,
            folds into a roof and lands again.
          </p>
        </motion.div>

        <motion.div
          style={{ y: cardY, opacity: cardOpacity }}
          className="glass-strong absolute right-6 top-28 hidden rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.28em] md:right-10 md:block"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent align-middle" />
          Reference · Continuous shell
        </motion.div>
      </div>
    </section>
  );
}

function GalleryTile({ photo, i }: { photo: Photo; i: number }) {
  const tall = i % 3 !== 1;
  return (
    <figure className="group relative overflow-hidden rounded-2xl" data-cursor="View">
      <div className={tall ? "aspect-[3/4]" : "aspect-[4/3]"}>
        <img
          src={photo.src}
          alt={`${photo.title}, ${photo.place}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      <figcaption className="glass-strong absolute bottom-2 left-2 right-2 flex flex-col gap-0.5 rounded-xl px-3 py-2.5 md:bottom-3 md:left-3 md:right-3 md:flex-row md:items-baseline md:justify-between md:gap-3 md:px-4 md:py-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
        <span className="font-display text-xs font-bold uppercase md:text-sm">{photo.title}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground md:text-[10px]">
          {photo.place}
        </span>
      </figcaption>
    </figure>
  );
}

function Column({
  photos,
  y,
  offset,
  start,
}: {
  photos: Photo[];
  y: MotionValue<string>;
  offset: string;
  start: number;
}) {
  return (
    <motion.div style={{ y }} className={"flex flex-col gap-3 md:gap-5 " + offset}>
      {photos.map((ph, i) => (
        <GalleryTile key={ph.src} photo={ph} i={start + i} />
      ))}
    </motion.div>
  );
}

/** Three columns of photography drifting at different speeds. */
export function Gallery() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const y1 = useTransform(p, [0, 1], ["6%", "-18%"]);
  const y2 = useTransform(p, [0, 1], ["-10%", "12%"]);
  const y3 = useTransform(p, [0, 1], ["14%", "-26%"]);
  const cols = [0, 1, 2].map((c) => GALLERY.filter((_, i) => i % 3 === c));

  return (
    <section
      ref={ref}
      data-section="Gallery"
      data-scene="3.5"
      className="hairline relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">
              <ScrambleText text="Field notes" />
            </p>
            <h2 className="display-lg mt-3">
              <ScrambleText text="Built Elsewhere" duration={1.1} />
            </h2>
          </div>
          <p className="glass glass-spot max-w-sm rounded-2xl p-5 text-sm leading-relaxed text-muted-foreground">
            Buildings we return to — for how they meet the ground, hold the light, or simply refuse
            to date.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          <Column photos={cols[0]!} y={y1} offset="" start={0} />
          <Column photos={cols[1]!} y={y2} offset="mt-24" start={1} />
          <Column photos={cols[2]!} y={y3} offset="hidden md:flex" start={2} />
        </div>
      </div>
    </section>
  );
}
