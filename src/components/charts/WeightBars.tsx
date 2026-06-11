"use client";

import { motion } from "framer-motion";

export interface WeightDatum {
  label: string;
  weight: number;
}

/**
 * Monochrome horizontal bar chart for curriculum domain weights.
 * Data is sourced live from markdown frontmatter on every request.
 */
export function WeightBars({
  data,
  weightLabel,
}: {
  data: WeightDatum[];
  weightLabel: string;
}) {
  const max = Math.max(...data.map((d) => d.weight), 1);

  return (
    <div className="flex flex-col gap-4">
      {data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="mb-1.5 truncate font-mono text-[11px] uppercase tracking-wide text-white/60">
              {d.label}
            </p>
            <div className="h-2 w-full border border-white/20 bg-white/5">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                whileInView={{ width: `${(d.weight / max) * 100}%` }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-white">
            {d.weight}
            <span className="ml-1 text-[10px] font-normal text-white/40">
              % {weightLabel}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
