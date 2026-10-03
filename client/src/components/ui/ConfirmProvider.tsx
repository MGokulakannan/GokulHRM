import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import { ConfirmContext } from "./confirmContext";
import type { ConfirmOptions } from "./confirmContext";

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((input: ConfirmOptions | string) => {
    const normalized: ConfirmOptions =
      typeof input === "string" ? { message: input } : input;

    setOptions(normalized);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Modal
        open={Boolean(options)}
        onClose={() => settle(false)}
        title={options?.title || "Are you sure?"}
        width={420}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => settle(false)}>
              {options?.cancelLabel || "Cancel"}
            </button>
            <button
              type="button"
              className={`btn ${options?.tone === "danger" ? "btn-outline-danger" : "btn-primary"}`}
              onClick={() => settle(true)}
              autoFocus
            >
              {options?.confirmLabel || "Confirm"}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
          {options?.message}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  );
};
