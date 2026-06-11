"use client";

import { motion } from "framer-motion";

/** kind: "autocomplete" | "ghost" | "chat" | "tools" | "agent" | "fleet" */
export interface IdeSim {
  title: string;
  kind: string;
  panelTitle: string;
  code: string[];
  extras: string[];
  footnote: string;
}

const lineVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: 0.25 + i * 0.18 },
  }),
};

function CodeLine({
  text,
  index,
  ghost = false,
}: {
  text: string;
  index: number;
  ghost?: boolean;
}) {
  return (
    <motion.div
      className="flex gap-4"
      custom={index}
      variants={lineVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <span className="w-5 shrink-0 select-none text-right text-white/25">
        {index + 1}
      </span>
      <span
        className={
          ghost
            ? "italic text-white/35"
            : text.trimStart().startsWith("//")
              ? "text-white/40"
              : "text-white/85"
        }
      >
        {text || "\u00a0"}
      </span>
    </motion.div>
  );
}

/**
 * A miniature monochrome editor window that "simulates" what the IDE of a
 * given era felt like — from token autocomplete to multi-agent fleets.
 */
export function IdeSimulation({ sim }: { sim: IdeSim }) {
  const codeCount = sim.code.length;

  return (
    <div>
      <div className="overflow-hidden border border-white/20 bg-black">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/15 bg-white/[0.04] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full border border-white/40" />
          <span className="h-2.5 w-2.5 rounded-full border border-white/25" />
          <span className="h-2.5 w-2.5 rounded-full border border-white/15" />
          <span className="ml-2 truncate font-mono text-[10px] uppercase tracking-widest text-white/45">
            {sim.title}
          </span>
        </div>

        {/* Code area */}
        <div className="space-y-1 px-4 py-4 font-mono text-[11px] leading-relaxed">
          {sim.code.map((line, i) => (
            <CodeLine key={`c-${i}`} text={line} index={i} />
          ))}

          {/* Ghost text continues inline in the code area */}
          {sim.kind === "ghost" &&
            sim.extras.map((line, i) => (
              <CodeLine
                key={`g-${i}`}
                text={line}
                index={codeCount + i}
                ghost
              />
            ))}

          {/* Autocomplete dropdown floats under the cursor */}
          {sim.kind === "autocomplete" && (
            <motion.div
              className="ml-9 mt-1 w-fit border border-white/30 bg-black shadow-[0_8px_24px_rgba(255,255,255,0.06)]"
              initial={{ opacity: 0, y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              {sim.extras.map((item, i) => (
                <div
                  key={item}
                  className={
                    i === 0
                      ? "bg-white px-3 py-1 text-[10px] font-bold text-black"
                      : "px-3 py-1 text-[10px] text-white/55"
                  }
                >
                  {item}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Bottom panel for chat / tools / agent / fleet eras */}
        {["chat", "tools", "agent", "fleet"].includes(sim.kind) && (
          <div className="border-t border-white/15">
            <div className="border-b border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
              {sim.panelTitle}
            </div>
            <div className="space-y-1.5 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed [scrollbar-width:thin]">
              {sim.extras.map((line, i) => {
                const isQuestion = /^[QS]:/.test(line);
                return (
                  <motion.div
                    key={`p-${i}`}
                    custom={i}
                    variants={lineVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className={
                      sim.kind === "chat"
                        ? isQuestion
                          ? "border-l-2 border-white pl-2 text-white"
                          : "border-l-2 border-white/20 pl-2 text-white/55"
                        : "whitespace-pre text-white/70"
                    }
                  >
                    {line}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 font-mono text-[10px] italic tracking-wide text-white/35">
        {sim.footnote}
      </p>
    </div>
  );
}
