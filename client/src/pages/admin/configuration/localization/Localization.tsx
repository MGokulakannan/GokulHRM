import { useMemo, useState } from "react";
import { Calendar, Clock, Coins } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import SettingsFooter from "../../../../components/admin/SettingsFooter";
import { useSettingsForm } from "../../../../components/admin/useSettingsForm";
import Field from "../../../../components/forms/Field";
import { SkeletonRows } from "../../../../components/ui/Skeleton";
import type { LocalizationSettings } from "../../../../services/configurationService";
import "../../../../components/admin/AdminPage.css";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY"];

const CURRENCIES = [
  { value: "INR", label: "INR – Indian Rupee" },
  { value: "USD", label: "USD – US Dollar" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "GBP", label: "GBP – Pound Sterling" },
  { value: "AED", label: "AED – UAE Dirham" },
  { value: "SGD", label: "SGD – Singapore Dollar" },
  { value: "AUD", label: "AUD – Australian Dollar" },
  { value: "CAD", label: "CAD – Canadian Dollar" },
  { value: "JPY", label: "JPY – Japanese Yen" },
];

const FALLBACK_ZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Europe/London", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Los_Angeles", "Australia/Sydney", "UTC",
];

const getTimeZones = (): string[] => {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
  const zones = supported ? supported("timeZone") : FALLBACK_ZONES;
  return zones.includes("UTC") ? zones : [...zones, "UTC"];
};

const formatDate = (date: Date, format: string, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  const monthShort = new Intl.DateTimeFormat("en-GB", { timeZone, month: "short" }).format(date);

  return format
    .replace("YYYY", get("year"))
    .replace("DD", get("day"))
    .replace("MMM", monthShort)
    .replace("MM", get("month"));
};

const Localization = () => {
  const { draft, setDraft, loading, saving, dirty, save, discard, restoreDefaults } =
    useSettingsForm("localization");

  const [now] = useState(() => new Date());
  const timeZones = useMemo(() => getTimeZones(), []);

  const preview = useMemo(() => {
    if (!draft) return null;

    try {
      return {
        date: formatDate(now, draft.dateFormat, draft.timezone),
        time: new Intl.DateTimeFormat("en-US", {
          timeZone: draft.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: draft.timeFormat === "12h",
        }).format(now),
        money: new Intl.NumberFormat("en", { style: "currency", currency: draft.currency }).format(125000.5),
      };
    } catch {
      return null;
    }
  }, [draft, now]);

  const update = <K extends keyof LocalizationSettings>(key: K, value: LocalizationSettings[K]) =>
    draft && setDraft({ ...draft, [key]: value });

  return (
    <div className="gh-page">
      <AdminPageHeader
        section="Configuration"
        title="Localization"
        description="Language, date and time formats, time zone and currency for your organization"
      />

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="gh-card">
            {loading || !draft ? (
              <div className="adm-card-body">
                <SkeletonRows rows={8} />
              </div>
            ) : (
              <>
                <div className="adm-card-body">
                  <div className="gh-form-grid">
                    <Field label="Language">
                      <select
                        className="form-select"
                        value={draft.language}
                        onChange={(event) => update("language", event.target.value)}
                      >
                        {LANGUAGES.map((language) => (
                          <option key={language.value} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Time zone">
                      <select
                        className="form-select"
                        value={draft.timezone}
                        onChange={(event) => update("timezone", event.target.value)}
                      >
                        {!timeZones.includes(draft.timezone) && (
                          <option value={draft.timezone}>{draft.timezone}</option>
                        )}
                        {timeZones.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Date format">
                      <select
                        className="form-select"
                        value={draft.dateFormat}
                        onChange={(event) => update("dateFormat", event.target.value)}
                      >
                        {DATE_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Time format">
                      <select
                        className="form-select"
                        value={draft.timeFormat}
                        onChange={(event) => update("timeFormat", event.target.value as "12h" | "24h")}
                      >
                        <option value="12h">12-hour (02:30 PM)</option>
                        <option value="24h">24-hour (14:30)</option>
                      </select>
                    </Field>
                    <Field label="Currency">
                      <select
                        className="form-select"
                        value={draft.currency}
                        onChange={(event) => update("currency", event.target.value)}
                      >
                        {!CURRENCIES.some((currency) => currency.value === draft.currency) && (
                          <option value={draft.currency}>{draft.currency}</option>
                        )}
                        {CURRENCIES.map((currency) => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Week starts on">
                      <select
                        className="form-select"
                        value={draft.weekStart}
                        onChange={(event) => update("weekStart", event.target.value)}
                      >
                        <option value="Monday">Monday</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <SettingsFooter
                  dirty={dirty}
                  saving={saving}
                  onSave={save}
                  onDiscard={discard}
                  onRestoreDefaults={restoreDefaults}
                />
              </>
            )}
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="gh-card adm-card-body">
            <h2 className="adm-section-title">Preview</h2>
            <p className="adm-section-help">How values look with the settings on the left.</p>
            {preview ? (
              <div className="adm-toggle-list">
                <div className="adm-toggle-row">
                  <span className="d-flex align-items-center gap-2 text-muted">
                    <Calendar size={15} /> Date
                  </span>
                  <strong>{preview.date}</strong>
                </div>
                <div className="adm-toggle-row">
                  <span className="d-flex align-items-center gap-2 text-muted">
                    <Clock size={15} /> Time
                  </span>
                  <strong>{preview.time}</strong>
                </div>
                <div className="adm-toggle-row">
                  <span className="d-flex align-items-center gap-2 text-muted">
                    <Coins size={15} /> Amount
                  </span>
                  <strong>{preview.money}</strong>
                </div>
              </div>
            ) : (
              <p className="adm-section-help mb-0">Preview unavailable for the current selection.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localization;
