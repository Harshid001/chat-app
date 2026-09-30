import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App, { Appearance } from "./App";
import AuthScreen from "./components/AuthScreen";
import { ErrorBoundary } from "./components/ui";
import { PwaUpdates } from "./components/Pwa";
import "./index.css";

const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Appearance>
        {key ? (
          <ClerkProvider
            publishableKey={key}
            appearance={{
              variables: {
                colorPrimary: "#2879ed",
                borderRadius: "16px",
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              },
            }}
          >
            <App />
          </ClerkProvider>
        ) : (
          <>
            <AuthScreen configured={false} />
            <PwaUpdates />
          </>
        )}
      </Appearance>
    </ErrorBoundary>
  </StrictMode>,
);
