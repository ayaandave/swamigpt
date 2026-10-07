"use client";

import { useSyncExternalStore } from "react";

// A tiny localStorage-backed store read through useSyncExternalStore,
// so server HTML uses defaults and the browser picks up saved values without effects.
export function createLocalStore<T extends object>(key: string, defaults: T) {
  const listeners = new Set<() => void>();
  let value: T | null = null;

  const load = (): T => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") };
    } catch {
      return defaults;
    }
  };

  const get = () => (value ??= load());

  const set = (next: T) => {
    value = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        value = load();
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useStore = () => useSyncExternalStore(subscribe, get, () => defaults);

  return { get, set, useStore };
}

const noop = () => () => {};

// True only in the browser after hydration; false during server render.
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
