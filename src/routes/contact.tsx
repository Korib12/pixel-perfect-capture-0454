import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { ScrambleText } from "@/components/site/ScrambleText";
import { Magnetic } from "@/components/site/Magnetic";
import { supabase } from "@/integrations/supabase/client";
import { useBrief } from "@/lib/saved-concepts";
import { conceptBySlug } from "@/lib/concepts";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Aether Studio" },
      {
        name: "description",
        content:
          "Tell Aether Studio about your site. We accept three new architectural commissions each year.",
      },
      { property: "og:title", content: "Contact — Aether Studio" },
      {
        property: "og:description",
        content: "Start a conversation with Aether Studio about your project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const PROJECT_TYPES = [
  "Private residence",
  "Cultural building",
  "Hospitality",
  "Urban masterplan",
  "Consultation",
];

const STUDIOS = [
  {
    city: "Zurich",
    tz: "Europe/Zurich",
    coords: "47.37° N · 8.54° E",
    img: "/photos/obsidian-house.jpg",
  },
  {
    city: "Lisbon",
    tz: "Europe/Lisbon",
    coords: "38.72° N · 9.14° W",
    img: "/photos/stone-curve-house.jpg",
  },
  {
    city: "Kyoto",
    tz: "Asia/Tokyo",
    coords: "35.01° N · 135.77° E",
    img: "/photos/quiet-chapel.jpg",
  },
];

function useTime(tz: string) {
  const [t, setT] = useState<{ time: string; open: boolean } | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
    });
    const hourFmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
      weekday: "short",
    });
    const tick = () => {
      const now = new Date();
      const parts = hourFmt.formatToParts(now);
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
      const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
      setT({ time: fmt.format(now), open: h >= 9 && h < 18 && !["Sat", "Sun"].includes(wd) });
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [tz]);
  return t;
}

function StudioCard({ s, i }: { s: (typeof STUDIOS)[number]; i: number }) {
  const t = useTime(s.tz);
  return (
    <Reveal delay={0.1 + i * 0.08}>
      <div className="group glass glass-spot relative overflow-hidden rounded-2xl">
        <img
          src={s.img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-35"
        />
        <div className="relative flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-xl font-bold uppercase">{s.city}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {s.coords}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold tabular-nums">{t?.time ?? "--:--"}</p>
            <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span
                className={
                  "inline-block h-1.5 w-1.5 rounded-full " +
                  (t?.open ? "animate-pulse bg-emerald-400" : "bg-muted-foreground/50")
                }
              />
              {t ? (t.open ? "Studio open" : "Closed") : ""}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Field({
  id,
  label,
  children,
  filled,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  filled: boolean;
}) {
  return (
    <div className="group relative">
      {children}
      <label
        htmlFor={id}
        className={
          "pointer-events-none absolute left-0 origin-left uppercase tracking-[0.28em] text-muted-foreground transition-all duration-300 group-focus-within:top-0 group-focus-within:text-[10px] group-focus-within:text-accent " +
          (filled ? "top-0 text-[10px]" : "top-6 text-xs")
        }
      >
        {label}
      </label>
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-focus-within:scale-x-100" />
    </div>
  );
}

const inputClass =
  "peer w-full border-b border-glass-border bg-transparent pb-3 pt-6 text-base outline-none transition-colors";

function Contact() {
  const { slugs } = useBrief();
  const [form, setForm] = useState({
    name: "",
    email: "",
    project_type: PROJECT_TYPES[0]!,
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const titleX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({ ...form, concepts: slugs });
    setSending(false);
    if (error) {
      toast.error("Your message didn't send. Please try again.");
      return;
    }
    setSent(true);
    setForm({ name: "", email: "", project_type: PROJECT_TYPES[0]!, message: "" });
  }

  const savedTitles = slugs.map((s) => conceptBySlug(s)?.title).filter(Boolean) as string[];

  return (
    <div className="-mt-24">
      {/* hero */}
      <section ref={heroRef} className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <motion.img
          src="/photos/wave-hall.jpg"
          alt=""
          className="absolute inset-0 h-[120%] w-full object-cover"
          style={{ y: imgY }}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-14 md:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <p className="eyebrow">
              <ScrambleText text="Enquiries — three commissions a year" trigger="mount" />
            </p>
            <motion.h1 style={{ x: titleX }} className="display-xl mt-4">
              {["Let's", "talk"].map((w, i) => (
                <span key={w} className="block overflow-hidden">
                  <motion.span
                    className={"block " + (i === 1 ? "text-accent" : "")}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
          </div>
        </div>
      </section>

      <div className="px-6 pb-28 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-16">
          {/* left column */}
          <div className="space-y-4 lg:col-span-5">
            <Reveal>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Send us the coordinates, the constraints and the ambition. Every enquiry is read by
                a studio principal, and we reply within two business days.
              </p>
            </Reveal>
            <div className="space-y-3 pt-6">
              {STUDIOS.map((s, i) => (
                <StudioCard key={s.city} s={s} i={i} />
              ))}
            </div>
            <Reveal delay={0.35}>
              <a
                href="mailto:studio@aether.example"
                className="group glass glass-spot flex items-center justify-between rounded-2xl p-5 transition-colors hover:text-accent"
              >
                <span className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  studio@aether.example
                </span>
                <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
              </a>
            </Reveal>
          </div>

          {/* form */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="glass-strong glass-spot relative overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="flex min-h-[560px] flex-col items-center justify-center p-10 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_20px_60px_-15px_oklch(0.78_0.09_72/70%)]"
                    >
                      <Check className="h-8 w-8" />
                    </motion.div>
                    <h2 className="mt-8 font-display text-3xl font-bold uppercase">
                      Message received
                    </h2>
                    <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                      Thank you. A studio principal will reply within two business days.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-8 rounded-full border border-glass-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-secondary"
                    >
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={onSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 p-6 md:p-10"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-2xl font-bold uppercase">Start a project</h2>
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                        Form 01
                      </span>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <Field id="name" label="Your name" filled={!!form.name}>
                        <input
                          id="name"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass}
                        />
                      </Field>
                      <Field id="email" label="Email" filled={!!form.email}>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <fieldset>
                      <legend className="eyebrow">Project type</legend>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PROJECT_TYPES.map((t) => {
                          const on = form.project_type === t;
                          return (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setForm({ ...form, project_type: t })}
                              aria-pressed={on}
                              className={
                                "relative rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors " +
                                (on
                                  ? "border-transparent text-accent-foreground"
                                  : "border-glass-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
                              }
                            >
                              {on && (
                                <motion.span
                                  layoutId="type-pill"
                                  className="absolute inset-0 rounded-full bg-accent"
                                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                />
                              )}
                              <span className="relative">{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <Field id="message" label="Site, programme, timeline…" filled={!!form.message}>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={inputClass + " resize-none"}
                      />
                    </Field>

                    {savedTitles.length > 0 && (
                      <div className="glass rounded-2xl p-4">
                        <p className="eyebrow">Attached from your brief</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {savedTitles.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-accent/40 px-3 py-1 text-xs text-accent"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <p className="text-xs text-muted-foreground">
                        We reply within two business days.
                      </p>
                      <Magnetic>
                        <button
                          type="submit"
                          disabled={sending}
                          data-cursor="Send"
                          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
                        >
                          <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                          <span className="relative flex items-center gap-3">
                            {sending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            )}
                            Send message
                          </span>
                        </button>
                      </Magnetic>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
