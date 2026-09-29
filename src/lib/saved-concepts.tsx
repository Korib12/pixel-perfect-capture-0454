import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const STORAGE_KEY = "aether.brief";

type BriefValue = {
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const BriefContext = createContext<BriefValue | null>(null);

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function BriefProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSlugs(readLocal());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      /* ignore */
    }
  }, [slugs, hydrated]);

  // When signed in, merge local selections into the account and read them back.
  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    (async () => {
      const local = readLocal();
      if (local.length) {
        await supabase
          .from("saved_concepts")
          .upsert(
            local.map((concept_slug) => ({ user_id: user.id, concept_slug })),
            { onConflict: "user_id,concept_slug" },
          );
      }
      const { data } = await supabase.from("saved_concepts").select("concept_slug");
      if (!cancelled && data) setSlugs(data.map((r) => r.concept_slug));
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  const toggle = useCallback(
    (slug: string) => {
      setSlugs((prev) => {
        const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
        if (user) {
          if (prev.includes(slug)) {
            void supabase
              .from("saved_concepts")
              .delete()
              .eq("user_id", user.id)
              .eq("concept_slug", slug);
          } else {
            void supabase
              .from("saved_concepts")
              .upsert({ user_id: user.id, concept_slug: slug }, { onConflict: "user_id,concept_slug" });
          }
        }
        return next;
      });
    },
    [user],
  );

  const remove = useCallback(
    (slug: string) => {
      setSlugs((prev) => prev.filter((s) => s !== slug));
      if (user) {
        void supabase.from("saved_concepts").delete().eq("user_id", user.id).eq("concept_slug", slug);
      }
    },
    [user],
  );

  const clear = useCallback(() => {
    setSlugs([]);
    if (user) void supabase.from("saved_concepts").delete().eq("user_id", user.id);
  }, [user]);

  return (
    <BriefContext.Provider
      value={{
        slugs,
        has: (slug) => slugs.includes(slug),
        toggle,
        remove,
        clear,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </BriefContext.Provider>
  );
}

export function useBrief() {
  const ctx = useContext(BriefContext);
  if (!ctx) throw new Error("useBrief must be used inside BriefProvider");
  return ctx;
}
