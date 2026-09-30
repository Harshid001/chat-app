import { lazy, Suspense, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@clerk/react";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import {
  Avatar,
  Brand,
  Button,
  ErrorNotice,
  IconButton,
  Spinner,
  ThemeMenu,
} from "./components/ui";

const NewConversation = lazy(() =>
  import("./components/Dialogs").then((m) => ({ default: m.NewConversation })),
);
const Settings = lazy(() =>
  import("./components/Dialogs").then((m) => ({ default: m.Settings })),
);
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
      ?.setAttribute("content", theme === "dark" ? "#0d120f" : "#f7f9f6");
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
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-60" />
        <Brand />
        <div className="relative z-10 rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
          <Spinner label="Making a little room for you…" />
          <p className="mt-2 text-xs text-muted-foreground">
            If this takes a while, check your connection.
          </p>
          <Button
            variant="outline"
            size="small"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
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
      <main className="relative flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-60" />
        <Brand />
        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
          {booting ? (
            <Spinner label="Getting your conversations ready…" />
          ) : (
            <ErrorNotice
              message={bootError || "Couldn’t load your account."}
              onRetry={initialize}
            />
          )}
        </div>
      </main>
    );

  return (
    <main className="h-dvh bg-background p-0 md:p-3 lg:p-4.5 selection:bg-primary/20">
      <div className="mx-auto flex h-full max-w-[1600px] overflow-hidden bg-surface/80 md:rounded-[28px] md:border md:border-border/80 md:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] dark:md:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Modern Left Dock Navigation Rail */}
        <nav
          aria-label="Main navigation"
          className="hidden w-[72px] shrink-0 flex-col items-center border-r border-border/80 bg-sidebar/90 py-5 backdrop-blur-2xl md:flex"
        >
          <Brand small iconOnly />

          <div className="mt-8 flex flex-col gap-2.5">
            <IconButton
              label="Messages"
              aria-current="page"
              onClick={useChat.getState().clearSelection}
              className="relative size-11 rounded-2xl bg-accent text-accent-foreground shadow-xs transition-transform active:scale-95"
            >
              <MessageCircle size={21} />
            </IconButton>

            <IconButton
              label="Compose a message"
              onClick={() => setDialog("new")}
              className="size-11 rounded-2xl text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-95"
            >
              <SquarePen size={20} />
            </IconButton>
          </div>

          <div className="mt-auto flex flex-col items-center gap-3">
            <ThemeMenu />
            <IconButton
              label="Open preferences"
              onClick={() => setDialog("settings")}
              className="size-11 rounded-2xl text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-95"
            >
              <Settings2 size={20} />
            </IconButton>
            <button
              onClick={() => setDialog("settings")}
              className="mt-1 transition-transform hover:scale-105 active:scale-95"
              title="Your profile"
            >
              <Avatar user={profile} size="avatar-small" />
            </button>
          </div>
        </nav>

        {/* Sidebar Conversations */}
        <Sidebar
          onNew={() => setDialog("new")}
          onSettings={() => setDialog("settings")}
        />

        {/* Chat Panel View */}
        <ChatPanel onNew={() => setDialog("new")} />
      </div>

      {/* Dialog Modals */}
      <Suspense fallback={null}>
        {dialog === "new" && (
          <NewConversation onClose={() => setDialog(null)} />
        )}
        {dialog === "settings" && <Settings onClose={() => setDialog(null)} />}
      </Suspense>

      <PwaUpdates />
    </main>
  );
}
