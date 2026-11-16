"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed list stores. useSyncExternalStore gives us the server
 * snapshot (empty) during hydration, so there are never hydration mismatches.
 */
function createListStore(key: string, max = 50) {
  const listeners = new Set<() => void>();
  const EMPTY: string[] = [];
  let cache: string[] | null = null;

  function read(): string[] {
    if (cache) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: string[]) {
    cache = next.slice(0, max);
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* storage may be unavailable (private mode) – keep in memory */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    subscribe,
    getSnapshot: read,
    getServerSnapshot: () => EMPTY,
    get: read,
    set: write,
    toggle(id: string): boolean {
      const cur = read();
      const has = cur.includes(id);
      write(has ? cur.filter((x) => x !== id) : [id, ...cur]);
      return !has;
    },
    push(id: string) {
      write([id, ...read().filter((x) => x !== id)]);
    },
    remove(id: string) {
      write(read().filter((x) => x !== id));
    },
    clear() {
      write([]);
    },
  };
}

export const favoritesStore = createListStore("lokalio:favorites", 200);
export const recentlyViewedStore = createListStore("lokalio:recent-viewed", 12);
export const recentSearchesStore = createListStore("lokalio:recent-searches", 5);

type ListStore = ReturnType<typeof createListStore>;

export function useListStore(store: ListStore): string[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export function useFavorites() {
  const ids = useListStore(favoritesStore);
  const toggle = useCallback((id: string) => favoritesStore.toggle(id), []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, toggle, has, count: ids.length };
}

/* ---------------- Theme ---------------- */

const themeListeners = new Set<() => void>();

function getTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(t: "light" | "dark") {
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
  try {
    window.localStorage.setItem("lokalio:theme", t);
  } catch {
    /* ignore */
  }
  themeListeners.forEach((l) => l());
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    getTheme,
    () => "light" as const,
  );
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

/* ---------------- Media query ---------------- */

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
