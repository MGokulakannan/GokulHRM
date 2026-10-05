import { useConfirm } from "../ui/useConfirm";
import "./AdminPage.css";

interface SettingsFooterProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onRestoreDefaults: () => void;
}

const SettingsFooter = ({ dirty, saving, onSave, onDiscard, onRestoreDefaults }: SettingsFooterProps) => {
  const confirm = useConfirm();

  const handleRestore = async () => {
    const confirmed = await confirm({
      title: "Restore defaults",
      message: "Replace the saved settings on this page with the original defaults?",
      confirmLabel: "Restore defaults",
      tone: "danger",
    });
    if (confirmed) onRestoreDefaults();
  };

  return (
    <div className="adm-form-footer">
      <button type="button" className="btn btn-sm btn-outline-danger me-auto" onClick={handleRestore} disabled={saving}>
        Restore defaults
      </button>
      {dirty && <span className="adm-form-note" style={{ marginRight: 0 }}>Unsaved changes</span>}
      <button type="button" className="btn btn-outline-primary" onClick={onDiscard} disabled={!dirty || saving}>
        Discard changes
      </button>
      <button type="button" className="btn btn-primary" onClick={onSave} disabled={!dirty || saving}>
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
};

export default SettingsFooter;
