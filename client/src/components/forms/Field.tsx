import { cloneElement, useId } from "react";
import type { ReactElement } from "react";

interface FieldProps {
  label: string;
  className?: string;
  children: ReactElement<{ id?: string }>;
}

// Pairs a visible label with its control so screen readers and click-to-focus work.
const Field = ({ label, className = "", children }: FieldProps) => {
  const id = useId();

  return (
    <div className={`gh-form-group ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
};

export default Field;
