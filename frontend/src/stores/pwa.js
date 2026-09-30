import { create } from "zustand";

export const usePwa = create(() => ({
  prompt: null,
  installed:
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigator.standalone),
}));
// Capture before Clerk loads; retain the prompt when auth screens change.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  usePwa.setState({ prompt: event });
});
window.addEventListener("appinstalled", () =>
  usePwa.setState({ installed: true, prompt: null }),
);
