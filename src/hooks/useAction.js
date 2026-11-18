import { App } from "antd";
import { useCallback } from "react";
import { getErrorMessage } from "../lib/errors";

/**
 * Wraps an RTK Query mutation trigger so every call:
 *   - is unwrapped (errors become exceptions instead of silently "succeeding")
 *   - shows a success / error toast with the server message
 *   - returns the response, or `null` on failure
 */
export const useAction = () => {
  const { message } = App.useApp();

  return useCallback(
    async (promise, { success, error, silent = false } = {}) => {
      try {
        const res = await (typeof promise?.unwrap === "function" ? promise.unwrap() : promise);
        if (!silent) message.success(success || res?.message || "Done");
        return res ?? true;
      } catch (err) {
        message.error(error ? `${error}: ${getErrorMessage(err)}` : getErrorMessage(err));
        return null;
      }
    },
    [message]
  );
};
