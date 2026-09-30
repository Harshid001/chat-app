import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@clerk/react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import { NewConversation, Settings } from "./components/Dialogs";
import { Brand, ErrorNotice, Spinner } from "./components/ui";
import { PwaUpdates } from "./components/Pwa";
import { serverUrl, setTokenProvider } from "./lib/api";
import { useChat } from "./stores/chat";
import { usePreferences } from "./stores/preferences";

export function Appearance({ children }) {
  const theme = usePreferences((state) => state.theme);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#151b24" : "#f4f6f8");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return children;
}

export default function App() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const {
    profile,
    booting,
    bootError,
    networkOnline,
    initialize,
    reset,
    setNetworkOnline,
    refresh,
  } = useChat(
    useShallow(
      ({
        profile,
        booting,
        bootError,
        networkOnline,
        initialize,
        reset,
        setNetworkOnline,
        refresh,
      }) => ({
        profile,
        booting,
        bootError,
        networkOnline,
        initialize,
        reset,
        setNetworkOnline,
        refresh,
      }),
    ),
  );
  const [dialog, setDialog] = useState(null);
  const [authUnavailable, setAuthUnavailable] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const controller = new AbortController();
    let active = true;
    // navigator.onLine can remain true behind a disconnected proxy or captive portal.
    // A cached shell must still render if the external identity SDK cannot load.
    const timer = setTimeout(() => {
      if (active) setAuthUnavailable(true);
    }, 12000);
    fetch(`${serverUrl}/health`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok && active) setAuthUnavailable(true);
      })
      .catch(() => {
        if (active) setAuthUnavailable(true);
      });
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isLoaded]);
  useEffect(() => {
    setTokenProvider(getToken);
    if (isLoaded && isSignedIn) initialize();
    return () => {
      reset();
      setTokenProvider(null);
    };
  }, [isLoaded, isSignedIn, userId, getToken, initialize, reset]);
  useEffect(() => {
    const online = () => {
      setNetworkOnline(true);
      if (isSignedIn && !useChat.getState().profile) initialize();
    };
    const offline = () => setNetworkOnline(false);
    const visible = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", visible);
    const poll = setInterval(() => {
      if (useChat.getState().connection !== "connected" && !document.hidden)
        refresh();
    }, 30000);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", visible);
      clearInterval(poll);
    };
  }, [setNetworkOnline, refresh, isSignedIn, initialize]);
  if ((!networkOnline || (!isLoaded && authUnavailable)) && !profile)
    return (
      <>
        <AuthScreen
          offline={!networkOnline}
          connectionError={authUnavailable}
        />
        <PwaUpdates />
      </>
    );
  if (!isLoaded)
    return (
      <main className="boot-screen">
        <Brand />
        <Spinner label="Making a little room for you…" />
        <p className="muted text-sm">
          If this takes a while, check your connection.
        </p>
        <button
          className="text-button"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </main>
    );
  if (!isSignedIn)
    return (
      <>
        <AuthScreen />
        <PwaUpdates />
      </>
    );
  if (!profile)
    return (
      <main className="boot-screen">
        <Brand />
        {booting ? (
          <Spinner label="Getting your conversations ready…" />
        ) : (
          <ErrorNotice
            message={bootError || "Couldn’t load your account."}
            onRetry={initialize}
          />
        )}
      </main>
    );
  return (
    <main className="app-page">
      <div className="app-caption">
        <span>FOR THE EVERYDAY & THE IN-BETWEEN</span>
        <span>YOUR PEOPLE, A LITTLE CLOSER.</span>
      </div>
      <div className="app-shell">
        <Sidebar
          onNew={() => setDialog("new")}
          onSettings={() => setDialog("settings")}
        />
        <ChatPanel onNew={() => setDialog("new")} />
      </div>
      <footer className="app-footer">
        <span>Small moments. Real connections.</span>
        <span>murmur.</span>
      </footer>
      {dialog === "new" && <NewConversation onClose={() => setDialog(null)} />}
      {dialog === "settings" && <Settings onClose={() => setDialog(null)} />}
      <PwaUpdates />
    </main>
  );
}
