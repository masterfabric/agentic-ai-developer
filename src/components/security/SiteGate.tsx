"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { Turnstile } from "@/components/security/Turnstile";

const STORAGE_KEY = "mfa-human";

/* Tiny external store so the gate state syncs with sessionStorage without
 * setState-in-effect (server snapshot = verified, so SSR renders no gate). */
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}
function getServerSnapshot() {
  return true;
}
function markHuman() {
  sessionStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((listener) => listener());
}

/**
 * Fullscreen human-verification gate shown once per browser session,
 * before the site content is revealed.
 */
export function SiteGate() {
  const human = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = !human;

  function handleVerify(token: string) {
    if (!token) return;
    markHuman();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-black px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
        >
          <Image
            src="/academy-badge.png"
            alt="MasterFabric Academy"
            width={96}
            height={96}
            className="rounded-full border border-white/20"
            priority
          />
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">
              Human verification / İnsan doğrulaması
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-wide text-white/30">
              MasterFabric Academy — MFA-AG-2026
            </p>
          </div>
          <Turnstile onVerify={handleVerify} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
