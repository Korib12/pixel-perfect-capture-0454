import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Bookmark, X } from "lucide-react";
import { motion } from "motion/react";
import { useBrief } from "@/lib/saved-concepts";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
  { to: "/portal", label: "Portal" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { slugs, setDrawerOpen } = useBrief();
  const { user } = useAuth();

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="glass mx-3 mt-3 flex items-center justify-between rounded-full px-4 py-2.5 md:mx-6 md:px-6">
          <Link to="/" className="font-display text-sm font-bold uppercase tracking-[0.35em]">
            Aether
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open project brief"
              className="relative flex items-center gap-2 rounded-full border border-glass-border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-secondary"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Brief</span>
              {slugs.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {slugs.length}
                </span>
              )}
            </button>

            <Link
              to="/portal"
              className="hidden rounded-full bg-primary px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-85 md:inline-flex"
            >
              {user ? "Board" : "Sign in"}
            </Link>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden rounded-full border border-glass-border p-2"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute right-0 top-0 flex h-full w-[78%] max-w-sm flex-col p-6"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-12 flex flex-col gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-3xl font-bold uppercase tracking-tight"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto hairline pt-6 text-xs text-muted-foreground">
              Aether Studio — Architecture
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
