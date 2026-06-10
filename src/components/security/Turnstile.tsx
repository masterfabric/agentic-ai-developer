"use client";

import { useEffect, useRef } from "react";

export const TURNSTILE_SITE_KEY = "0x4AAAAAADiKN-vVhRAOKLxK";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads the Turnstile script exactly once (explicit rendering mode). */
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Reusable Cloudflare Turnstile widget (dark theme to match the monochrome
 * site). Calls onVerify with the token on success and with "" when the
 * token expires or errors out.
 */
export function Turnstile({
  onVerify,
  siteKey = TURNSTILE_SITE_KEY,
  className,
}: {
  onVerify: (token: string) => void;
  siteKey?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onVerifyRef.current(""),
        "error-callback": () => onVerifyRef.current(""),
      });
    });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} className={className} />;
}
