import { Info } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import SettingsFooter from "../../../../components/admin/SettingsFooter";
import ToggleRow from "../../../../components/admin/ToggleRow";
import { useSettingsForm } from "../../../../components/admin/useSettingsForm";
import Field from "../../../../components/forms/Field";
import { SkeletonRows } from "../../../../components/ui/Skeleton";
import type { NotificationSettings } from "../../../../services/configurationService";
import "../../../../components/admin/AdminPage.css";

const EVENTS: Array<{ key: keyof NotificationSettings["events"]; title: string; help: string }> = [
  { key: "leaveApplied", title: "Leave request submitted", help: "Notify approvers when an employee applies for leave" },
  { key: "leaveDecision", title: "Leave approved or rejected", help: "Notify the employee when their request is decided" },
  { key: "newEmployee", title: "New employee added", help: "Welcome message with sign-in details" },
  { key: "vacancyPosted", title: "New vacancy posted", help: "Announce open positions internally" },
  { key: "performanceReview", title: "Performance review assigned", help: "Notify employees when a review is created for them" },
  { key: "passwordChanged", title: "Password changed", help: "Security alert whenever an account password changes" },
];

const EmailNotifications = () => {
  const { draft, setDraft, loading, saving, dirty, save, discard, restoreDefaults } =
    useSettingsForm("notifications");

  return (
    <div className="gh-page">
      <AdminPageHeader
        section="Configuration"
        title="Email Notifications"
        description="Control which events send an email and who they come from"
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
                  <ToggleRow
                    title="Send email notifications"
                    help="Master switch. When off, no notification emails are sent."
                    checked={draft.enabled}
                    onChange={(enabled) => setDraft({ ...draft, enabled })}
                  />
                </div>

                <div className="adm-card-body" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <h2 className="adm-section-title">Sender</h2>
                  <p className="adm-section-help">How notification emails appear in recipients' inboxes.</p>
                  <div className="gh-form-grid">
                    <Field label="Sender name" className="gh-form-grid-full">
                      <input
                        className="form-control"
                        maxLength={100}
                        value={draft.senderName}
                        onChange={(event) => setDraft({ ...draft, senderName: event.target.value })}
                      />
                    </Field>
                    <Field label="Sender email">
                      <input
                        className="form-control"
                        type="email"
                        placeholder="hr@yourcompany.com"
                        value={draft.senderEmail}
                        onChange={(event) => setDraft({ ...draft, senderEmail: event.target.value })}
                      />
                    </Field>
                    <Field label="Reply-to email">
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Optional"
                        value={draft.replyTo}
                        onChange={(event) => setDraft({ ...draft, replyTo: event.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="adm-card-body" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <h2 className="adm-section-title">Notify me when…</h2>
                  <p className="adm-section-help">Pick the events that should trigger an email.</p>
                  <div className="adm-toggle-list">
                    {EVENTS.map((event) => (
                      <ToggleRow
                        key={event.key}
                        title={event.title}
                        help={event.help}
                        disabled={!draft.enabled}
                        checked={draft.events[event.key]}
                        onChange={(checked) =>
                          setDraft({ ...draft, events: { ...draft.events, [event.key]: checked } })
                        }
                      />
                    ))}
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
            <h2 className="adm-section-title d-flex align-items-center gap-2">
              <Info size={15} /> About delivery
            </h2>
            <p className="adm-section-help mb-0">
              These preferences are saved on the server. Sending real emails needs a mail provider (SMTP) to be
              connected, which isn't set up yet. Leave approvals and rejections already reach employees as in-app
              notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;
