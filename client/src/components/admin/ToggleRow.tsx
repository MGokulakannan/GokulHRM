import { useId } from "react";
import "./AdminPage.css";

interface ToggleRowProps {
  title: string;
  help?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

// A labelled on/off switch row (Email Notifications events, Modules).
const ToggleRow = ({ title, help, checked, disabled, onChange }: ToggleRowProps) => {
  const id = useId();

  return (
    <div className={`adm-toggle-row ${disabled ? "is-disabled" : ""}`.trim()}>
      <label htmlFor={id} style={{ cursor: disabled ? "not-allowed" : "pointer", margin: 0 }}>
        <strong>{title}</strong>
        {help && <span className="adm-toggle-help">{help}</span>}
      </label>
      <span className="adm-switch">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="adm-switch-track" />
      </span>
    </div>
  );
};

export default ToggleRow;
