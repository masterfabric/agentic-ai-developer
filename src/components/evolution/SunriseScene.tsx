"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Scroll-driven finale: night fades, stars dissolve, and a layered sun —
 * crisp disc, pulsing corona, slow-turning rays — rises over the horizon,
 * spilling a glint along the line and a shimmering pillar of light below it.
 * The dawn of the agentic era carries the closing thought, then dissolves.
 */

/* Round to a fixed precision so SSR (Node) and client (browser) produce
 * byte-identical SVG coordinates — Math.sin/cos are not guaranteed to be
 * bit-identical across JS engines, which otherwise triggers a hydration
 * mismatch on the sun's rays. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/* Deterministic star field (SSR-safe, no Math.random). */
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 137.508) % 100,
  top: ((i * 61.803) % 50) + 3,
  size: 1 + ((i * 7) % 3) * 0.6,
  delay: (i % 7) * 0.55,
  duration: 2.6 + (i % 5) * 0.9,
}));

export function SunriseScene({
  caption,
  outro,
}: {
  caption: string;
  outro: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const sunY = useTransform(scrollYProgress, [0.12, 0.62], ["24vh", "-4vh"]);
  const sunOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.3, 0.75, 0.92],
    [0, 1, 1, 0],
  );
  const sunScale = useTransform(scrollYProgress, [0.1, 0.88], [0.75, 1.2]);
  const horizonOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.28, 0.8, 0.93],
    [0, 1, 1, 0],
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0.32, 0.52, 0.78, 0.92],
    [0, 1, 1, 0],
  );
  const captionOpacity = useTransform(scrollYProgress, [0.12, 0.26, 0.4], [0, 1, 0]);

  // Night dissolves into dawn: stars fade as the sun climbs.
  const starsOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.25, 0.55, 0.7],
    [0, 0.9, 0.35, 0],
  );
  // Warmth pooling above the horizon, glint spreading along it.
  const warmthOpacity = useTransform(
    scrollYProgress,
    [0.18, 0.5, 0.8, 0.93],
    [0, 1, 1, 0],
  );
  const glintScaleX = useTransform(scrollYProgress, [0.18, 0.65], [0.25, 1]);
  // Reflected pillar of light beneath the horizon.
  const pillarOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.55, 0.8, 0.92],
    [0, 0.85, 0.85, 0],
  );

  return (
    <div ref={ref} className="relative h-[120vh]">
      <div className="sticky top-0 flex h-[70vh] min-h-[480px] flex-col items-center justify-center overflow-hidden">
        {/* Star field — the night before the agentic dawn */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ opacity: starsOpacity }}
        >
          {STARS.map((star, i) => (
            <span
              key={i}
              className="sunrise-star absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </motion.div>

        {/* Caption (early hint) */}
        <motion.p
          className="absolute top-24 z-10 px-6 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-white/40"
          style={{ opacity: captionOpacity }}
        >
          {caption}
        </motion.p>

        {/* Outro quote rides above the sun */}
        <motion.blockquote
          className="relative z-10 mx-auto max-w-2xl px-6 text-center text-lg italic leading-relaxed text-white/85 sm:text-xl"
          style={{
            opacity: textOpacity,
            fontFamily: "var(--font-lora), Georgia, serif",
          }}
        >
          {outro}
        </motion.blockquote>

        {/* Sun: atmospheric glow + slow rays + pulsing corona + crisp disc */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2"
          style={{ y: sunY, opacity: sunOpacity, scale: sunScale }}
        >
          {/* Atmospheric bleed */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,237,184,0.5) 0%, rgba(255,200,120,0.28) 38%, rgba(255,160,90,0.1) 58%, transparent 72%)",
            }}
          />

          {/* Slow-turning rays */}
          <svg viewBox="0 0 200 200" className="sunrise-rays absolute inset-0 h-full w-full">
            <g stroke="#ffe9b0" strokeWidth="1.1" strokeLinecap="round" opacity="0.5">
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * Math.PI) / 6;
                const inner = i % 2 === 0 ? 34 : 30;
                const outer = i % 2 === 0 ? 52 : 44;
                return (
                  <line
                    key={i}
                    x1={r3(100 + Math.cos(angle) * inner)}
                    y1={r3(100 + Math.sin(angle) * inner)}
                    x2={r3(100 + Math.cos(angle) * outer)}
                    y2={r3(100 + Math.sin(angle) * outer)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Pulsing corona */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[26vmin] w-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,244,210,0.55) 30%, rgba(255,210,140,0.25) 60%, transparent 75%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Crisp solar disc */}
          <div
            className="absolute left-1/2 top-1/2 h-[15vmin] w-[15vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #fffef8 0%, #fff7dd 55%, #ffe9a8 78%, rgba(255,205,130,0.9) 100%)",
              boxShadow:
                "0 0 50px 18px rgba(255,225,160,0.4), 0 0 140px 50px rgba(255,190,110,0.18)",
            }}
          />
        </motion.div>

        {/* Dawn warmth pooling above the horizon */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[28%] h-[36%]"
          style={{
            opacity: warmthOpacity,
            background:
              "radial-gradient(60% 100% at 50% 100%, rgba(255,195,125,0.16), transparent 72%)",
          }}
        />

        {/* Horizon: base lines + warm glint spreading with the sunrise */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-[28%] left-0 right-0"
          style={{ opacity: horizonOpacity }}
        >
          <motion.div
            className="mx-auto h-[2px] max-w-3xl"
            style={{
              scaleX: glintScaleX,
              background:
                "linear-gradient(to right, transparent, rgba(255,226,160,0.95), transparent)",
              boxShadow: "0 0 18px 2px rgba(255,210,140,0.35)",
            }}
          />
          <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="mx-auto mt-1 h-px max-w-2xl bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </motion.div>

        {/* Ground mask: hides the sun below the horizon */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 z-[5] h-[28%] bg-gradient-to-t from-black via-black to-black/0"
        />

        {/* Shimmering pillar of reflected light on the ground */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 z-[6] h-[26%] w-[14vmin] -translate-x-1/2"
          style={{ opacity: pillarOpacity }}
        >
          <motion.div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,220,150,0.30), rgba(255,200,120,0.08) 55%, transparent)",
              filter: "blur(7px)",
              maskImage:
                "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
            }}
            animate={{ opacity: [0.7, 1, 0.85, 1, 0.7], scaleX: [1, 0.92, 1.05, 0.95, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
