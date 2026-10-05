import { useCallback, useEffect, useState } from "react";
import { useToast } from "../ui/useToast";
import { getApiError } from "../../utils/apiError";
import { getSettings, resetSettings, saveSettings } from "../../services/configurationService";
import type { SettingsMap } from "../../services/configurationService";

// Load / edit / save / reset for one Configuration group, with dirty tracking.
export const useSettingsForm = <K extends keyof SettingsMap>(
  key: K,
  onSaved?: (value: SettingsMap[K]) => void
) => {
  const { showToast } = useToast();

  const [saved, setSaved] = useState<SettingsMap[K] | null>(null);
  const [draft, setDraft] = useState<SettingsMap[K] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSettings(key)
      .then((value) => {
        if (cancelled) return;
        setSaved(value);
        setDraft(value);
      })
      .catch((error) => {
        if (!cancelled) showToast(getApiError(error, "Failed to load settings"), "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, showToast]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);

    try {
      const value = await saveSettings(key, draft);
      setSaved(value);
      setDraft(value);
      onSaved?.(value);
      showToast("Settings saved", "success");
    } catch (error) {
      showToast(getApiError(error, "Failed to save settings"), "error");
    } finally {
      setSaving(false);
    }
  }, [draft, key, onSaved, showToast]);

  const restoreDefaults = useCallback(async () => {
    setSaving(true);

    try {
      const value = await resetSettings(key);
      setSaved(value);
      setDraft(value);
      onSaved?.(value);
      showToast("Settings restored to defaults", "success");
    } catch (error) {
      showToast(getApiError(error, "Failed to restore defaults"), "error");
    } finally {
      setSaving(false);
    }
  }, [key, onSaved, showToast]);

  const discard = () => setDraft(saved);

  return { draft, setDraft, loading, saving, dirty, save, discard, restoreDefaults };
};
