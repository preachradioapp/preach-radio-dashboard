import { App } from "antd";
import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Protects unsaved edits:
 * - closing / reloading the tab shows the browser's "leave site?" prompt
 * - navigating inside the dashboard (sidebar, back button) asks for confirmation
 */
export const useUnsavedChangesPrompt = (when) => {
  const { modal } = App.useApp();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname
  );
  // The blocker object changes identity between renders; react only to its state.
  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    modal.confirm({
      title: "Discard unsaved changes?",
      content: "You have edits that haven't been published. If you leave now, they'll be lost.",
      okText: "Discard and leave",
      okButtonProps: { danger: true },
      cancelText: "Keep editing",
      onOk: () => blockerRef.current.proceed?.(),
      onCancel: () => blockerRef.current.reset?.(),
    });
  }, [blocker.state, modal]);

  useEffect(() => {
    if (!when) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);
};
