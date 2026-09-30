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
          colorPrimary: dark ? "#34d399" : "#245239",
          colorBackground: dark ? "#141b16" : "#ffffff",
          colorForeground: dark ? "#eef3ed" : "#1a221e",
          colorMutedForeground: dark ? "#92a496" : "#5c6b61",
          colorInput: dark ? "#1c261f" : "#f0f4ee",
          colorInputForeground: dark ? "#eef3ed" : "#1a221e",
          colorNeutral: dark ? "#eef3ed" : "#1a221e",
          borderRadius: "16px",
          fontFamily: "Inter Variable, Inter, sans-serif",
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}
