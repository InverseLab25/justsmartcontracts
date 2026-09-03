import { useCallback } from "react";
import { useNotifications } from "@shared/lib/notify";

// Shared because both the wallet menu and the footer's donation address copy.
export const useCopyToClipboard = () => {
  const notify = useNotifications();

  return useCallback(
    (value: string, label = "Copied") => {
      navigator.clipboard
        .writeText(value)
        .then(() => notify(label, "success"))
        .catch(() => notify("Could not copy", "error"));
    },
    [notify]
  );
};
