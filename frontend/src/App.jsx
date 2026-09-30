import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@clerk/react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import { NewConversation, Settings } from "./components/Dialogs";
import {
  Brand,
  ErrorNotice,
  IconButton,
  Spinner,
  ThemeMenu,
} from "./components/ui";
import { PwaUpdates } from "./components/Pwa";
import { serverUrl, setTokenProvider } from "./lib/api";
import { useChat } from "./stores/chat";
import { useEffectiveTheme } from "./lib/useEffectiveTheme";
import { MessageCircle, Settings2, SquarePen } from "lucide-react";

export function Appearance({ children }) {
  const theme = useEffectiveTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#131715" : "#f5f6f3");
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
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
        <Brand />
        <Spinner label="Making a little room for you…" />
        <p className="text-sm text-muted-foreground">
          If this takes a while, check your connection.
        </p>
        <button
          className="rounded-full border bg-surface px-5 py-2.5 text-sm"
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
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
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
    <main className="h-dvh bg-background md:p-4 lg:p-6">
      <div className="mx-auto flex h-full max-w-[1600px] overflow-hidden bg-surface/60 md:rounded-[26px] md:border md:shadow-[0_8px_40px_-24px_rgba(20,40,26,.15)]">
        <nav
          aria-label="Main navigation"
          className="hidden w-[68px] shrink-0 flex-col items-center border-r bg-surface/60 py-6 backdrop-blur-2xl md:flex"
        >
          <Brand small iconOnly />
          <div className="mt-9 flex flex-col gap-3">
            <IconButton
              label="Messages"
              aria-current="page"
              onClick={useChat.getState().clearSelection}
              className="bg-accent text-accent-foreground"
            >
              <MessageCircle size={20} />
            </IconButton>
            <IconButton
              label="Compose a message"
              onClick={() => setDialog("new")}
            >
              <SquarePen size={19} />
            </IconButton>
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <ThemeMenu />
            <IconButton
              label="Open preferences"
              onClick={() => setDialog("settings")}
            >
              <Settings2 size={19} />
            </IconButton>
          </div>
        </nav>
        <Sidebar
          onNew={() => setDialog("new")}
          onSettings={() => setDialog("settings")}
        />
        <ChatPanel onNew={() => setDialog("new")} />
      </div>
      {dialog === "new" && <NewConversation onClose={() => setDialog(null)} />}
      {dialog === "settings" && <Settings onClose={() => setDialog(null)} />}
      <PwaUpdates />
    </main>
  );
}
