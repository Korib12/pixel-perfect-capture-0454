import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import type Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Inertial smooth scrolling (Lenis). Scrolls the real window, so motion's
 * useScroll and native sticky positioning keep working unchanged.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let instance: Lenis | null = null;
    let raf = 0;
    let cancelled = false;

    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      instance = new LenisCtor({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4,
      });
      const loop = (time: number) => {
        instance?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      document.documentElement.classList.add("lenis", "lenis-smooth");
      setLenis(instance);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      instance?.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      setLenis(null);
    };
  }, []);

  // New page → start at the top without a smooth glide.
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  // Pause scrolling while a modal/drawer locks the body.
  useEffect(() => {
    if (!lenis) return;
    const obs = new MutationObserver(() => {
      const locked =
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked");
      if (locked) lenis.stop();
      else lenis.start();
    });
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });
    return () => obs.disconnect();
  }, [lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
