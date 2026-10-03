import { useEffect } from "react";
import type { ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

const Modal = ({ open, onClose, title, subtitle, children, footer, width = 480 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="gh-modal-backdrop" onClick={onClose}>
      <div
        className="gh-modal"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gh-modal-title"
      >
        <div className="gh-modal-header">
          <div>
            <h2 id="gh-modal-title">{title}</h2>
            {subtitle && <p className="gh-modal-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="gh-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="gh-modal-body">{children}</div>

        {footer && <div className="gh-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
