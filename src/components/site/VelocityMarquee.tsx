import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Endless ticker whose speed and direction follow scroll velocity,
 * with a slight skew while the page is moving fast.
 */
export function VelocityMarquee({
  items,
  baseVelocity = 2.2,
  className,
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 300 });
  const factor = useTransform(smooth, [0, 1200], [0, 6], { clamp: false });
  const skew = useTransform(smooth, [-2500, 0, 2500], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-10 pr-10">
          <span>{t}</span>
          <span className="inline-block h-2 w-2 rotate-45 bg-accent" />
        </span>
      ))}
    </>
  );

  return (
    <div className={"overflow-hidden whitespace-nowrap " + (className ?? "")}>
      <motion.div className="flex w-max" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex" aria-hidden={k > 0}>
            {row}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
