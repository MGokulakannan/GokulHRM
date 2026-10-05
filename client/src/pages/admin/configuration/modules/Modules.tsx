import { CalendarDays, Clock, BarChart3, Briefcase, Target, Lock } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import SettingsFooter from "../../../../components/admin/SettingsFooter";
import ToggleRow from "../../../../components/admin/ToggleRow";
import { useSettingsForm } from "../../../../components/admin/useSettingsForm";
import { SkeletonRows } from "../../../../components/ui/Skeleton";
import { setModules } from "../../../../context/modulesStore";
import type { ModuleSettings } from "../../../../services/configurationService";
import "../../../../components/admin/AdminPage.css";

const MODULES: Array<{
  key: keyof ModuleSettings;
  title: string;
  help: string;
  icon: typeof Clock;
}> = [
  { key: "attendance", title: "Attendance", help: "Check-in / check-out and attendance history", icon: Clock },
  { key: "leave", title: "Leave Management", help: "Leave requests, approvals and balances", icon: CalendarDays },
  { key: "recruitment", title: "Recruitment", help: "Vacancies and candidate tracking", icon: Briefcase },
  { key: "performance", title: "Performance", help: "Goals and performance reviews", icon: Target },
  { key: "reports", title: "Reports", help: "Workforce, leave and attendance reports", icon: BarChart3 },
];

const Modules = () => {
  // Updating the shared store makes the sidebar and route guards react straight away.
  const { draft, setDraft, loading, saving, dirty, save, discard, restoreDefaults } =
    useSettingsForm("modules", setModules);

  const enabledCount = draft ? MODULES.filter((module) => draft[module.key]).length : 0;

  return (
    <div className="gh-page">
      <AdminPageHeader
        section="Configuration"
        title="Modules"
        description="Choose which parts of Gokul HRM are available to your organization"
        meta={draft && <span className="ms-2">· {enabledCount} of {MODULES.length} optional modules on</span>}
      />

      <div className="gh-card" style={{ maxWidth: 760 }}>
        {loading || !draft ? (
          <div className="adm-card-body">
            <SkeletonRows rows={6} />
          </div>
        ) : (
          <>
            <div className="adm-card-body">
              <h2 className="adm-section-title">Optional modules</h2>
              <p className="adm-section-help">
                Turning a module off hides it from the menu for everyone and blocks its pages. Existing data is kept.
              </p>

              <div className="adm-toggle-list">
                {MODULES.map((module) => (
                  <ToggleRow
                    key={module.key}
                    title={module.title}
                    help={module.help}
                    checked={draft[module.key]}
                    onChange={(checked) => setDraft({ ...draft, [module.key]: checked })}
                  />
                ))}
              </div>
            </div>

            <div className="adm-card-body" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h2 className="adm-section-title d-flex align-items-center gap-2">
                <Lock size={15} /> Always on
              </h2>
              <p className="adm-section-help mb-0">
                Dashboard, Employees, Departments, Designations, Settings and this Organization area can't be turned off.
              </p>
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
  );
};

export default Modules;
