import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useBrief } from "@/lib/saved-concepts";

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

const PROJECT_TYPES = [
  "Private residence",
  "Cultural building",
  "Hospitality",
  "Urban masterplan",
  "Consultation",
];

const inputClass =
  "w-full border-b border-glass-border bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent transition-colors";

function Contact() {
  const { slugs } = useBrief();
  const [form, setForm] = useState({
    name: "",
    email: "",
    project_type: PROJECT_TYPES[0]!,
    message: "",
  });
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({ ...form, concepts: slugs });
    setSending(false);
    if (error) {
      toast.error("Your message didn't send. Please try again.");
      return;
    }
    toast.success("Message sent — we'll reply within two business days.");
    setForm({ name: "", email: "", project_type: PROJECT_TYPES[0]!, message: "" });
  }

  return (
    <div className="px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">Enquiries</p>
          <h1 className="display-lg mt-3">Contact</h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Send us the coordinates, the constraints and the ambition. Every enquiry is read by
            a studio principal.
          </p>

          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="eyebrow">Studio</dt>
              <dd className="mt-2 text-muted-foreground">Zurich · Lisbon · Kyoto</dd>
            </div>
            <div>
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2 text-muted-foreground">studio@aether.example</dd>
            </div>
            <div>
              <dt className="eyebrow">Hours</dt>
              <dd className="mt-2 text-muted-foreground">Mon–Fri, 09:00–18:00 CET</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <form onSubmit={onSubmit} className="glass space-y-8 p-6 md:p-10">
            <div>
              <label className="eyebrow" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="eyebrow" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="eyebrow" htmlFor="type">
                Project type
              </label>
              <select
                id="type"
                value={form.project_type}
                onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                className={inputClass + " text-foreground"}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-popover text-popover-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="eyebrow" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Site, programme, timeline…"
                className={inputClass + " resize-none"}
              />
            </div>

            {slugs.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {slugs.length} saved concept{slugs.length === 1 ? "" : "s"} will be attached to
                this message.
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Send message
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
