import { useContext } from "react";
import { ConfirmContext } from "./confirmContext";
import type { ConfirmOptions } from "./confirmContext";

export const useConfirm = (): ((options: ConfirmOptions | string) => Promise<boolean>) => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }

  return context.confirm;
};
