"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, type Locale } from "../dictionary";
import {
  clearSession,
  loadSession,
  saveSession,
  type SessionState,
} from "../session";

export function useDashboardSession() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const current = loadSession();
    if (!current) {
      router.replace("/login");
      return;
    }

    setSession(current);
    setLocale(current.locale);
  }, [router]);

  function updateLocale(nextLocale: Locale) {
    if (!session) {
      return;
    }

    setLocale(nextLocale);
    startTransition(() => {
      const updated = { ...session, locale: nextLocale };
      saveSession(updated);
      setSession(updated);
    });
  }

  function clearAndRedirect() {
    clearSession();
    router.replace("/login");
  }

  return {
    session,
    locale,
    setLocale: updateLocale,
    clearAndRedirect,
  };
}
