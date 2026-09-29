import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBrief } from "@/lib/saved-concepts";
import { conceptBySlug } from "@/lib/concepts";
import { supabase } from "@/integrations/supabase/client";

export function BriefDrawer() {
  const { slugs, drawerOpen, setDrawerOpen, remove, clear } = useBrief();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const items = slugs.map(conceptBySlug).filter(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      project_type: "Project brief",
      message: message || "Brief submitted from saved concepts.",
      concepts: slugs,
    });
    setSending(false);
    if (error) {
      toast.error("We couldn't send your brief. Please try again.");
      return;
    }
    toast.success("Brief received — our studio will reply within two business days.");
    setName("");
    setEmail("");
    setMessage("");
    clear();
    setDrawerOpen(false);
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            aria-label="Close brief"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Project brief</p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase">
                  {items.length} concept{items.length === 1 ? "" : "s"}
                </h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close brief">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="mt-10 text-sm text-muted-foreground">
                Nothing saved yet. Bookmark concepts from the portfolio to build a brief.
              </p>
            ) : (
              <ul className="mt-8 space-y-3">
                {items.map((c) => (
                  <li key={c!.slug} className="flex items-center gap-3 rounded-sm bg-secondary/50 p-2">
                    <img
                      src={c!.image}
                      alt={c!.title}
                      loading="lazy"
                      className="h-14 w-16 flex-none object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c!.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{c!.location}</p>
                    </div>
                    <button
                      onClick={() => remove(c!.slug)}
                      aria-label={`Remove ${c!.title}`}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submit} className="mt-10 space-y-3">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border-b border-glass-border bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-accent"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border-b border-glass-border bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-accent"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notes for the studio (optional)"
                rows={3}
                className="w-full resize-none border-b border-glass-border bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-accent"
              />
              <button
                type="submit"
                disabled={sending || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit inquiry
              </button>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
