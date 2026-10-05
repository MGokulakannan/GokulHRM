import { useEffect, useSyncExternalStore } from "react";
import { getSettings } from "../services/configurationService";
import type { ModuleSettings } from "../services/configurationService";

// App-wide cache of the Configuration → Modules switches, shared by the sidebar,
// route guards and the Modules page. Until it loads (or if it fails to) every
// module is treated as enabled, so a settings outage never locks anyone out.

let cache: ModuleSettings | null = null;
let loading = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setModules = (modules: ModuleSettings | null) => {
  cache = modules;
  emit();
};

// Called on logout so the next user never sees the previous user's cached state.
export const clearModules = () => setModules(null);

const load = () => {
  if (loading) return;
  loading = true;

  getSettings("modules")
    .then(setModules)
    .catch(() => undefined)
    .finally(() => {
      loading = false;
    });
};

export const useModules = (): ModuleSettings | null => {
  const modules = useSyncExternalStore(subscribe, () => cache);

  useEffect(() => {
    if (!modules) load();
  }, [modules]);

  return modules;
};

export const isModuleEnabled = (
  modules: ModuleSettings | null,
  key: keyof ModuleSettings
): boolean => modules?.[key] !== false;
