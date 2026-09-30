import { useSyncExternalStore } from "react";
import { usePreferences } from "../stores/preferences";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const subscribe = (callback) => {
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function useEffectiveTheme() {
  const theme = usePreferences((state) => state.theme);
  const systemDark = useSyncExternalStore(subscribe, () => media.matches);
  return theme === "dark" || (theme === "system" && systemDark)
    ? "dark"
    : "light";
}
