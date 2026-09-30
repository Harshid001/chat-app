import { ClerkProvider } from "@clerk/react";
import App from "./App";
import AuthScreen from "./components/AuthScreen";
import { PwaUpdates } from "./components/Pwa";
import { useEffectiveTheme } from "./lib/useEffectiveTheme";
const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export default function Chime() {
  const dark = useEffectiveTheme() === "dark";
  if (!key)
    return (
      <>
        <AuthScreen configured={false} />
        <PwaUpdates />
      </>
    );
  return (
    <ClerkProvider
      publishableKey={key}
      localization={{
        signIn: { start: { title: "Sign in to Chime" } },
        signUp: { start: { title: "Create your Chime account" } },
      }}
      appearance={{
        variables: {
          colorPrimary: dark ? "#b6cfa4" : "#365e49",
          colorBackground: dark ? "#1b201d" : "#ffffff",
          colorForeground: dark ? "#edf0e9" : "#242a27",
          colorMutedForeground: dark ? "#a0aaa1" : "#68716a",
          colorInput: dark ? "#272e28" : "#f5f6f3",
          colorInputForeground: dark ? "#edf0e9" : "#242a27",
          colorNeutral: dark ? "#edf0e9" : "#242a27",
          borderRadius: "16px",
          fontFamily: "Inter Variable, Inter, sans-serif",
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}
