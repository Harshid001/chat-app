import { SignIn, SignUp } from "@clerk/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { Avatar, Brand, Button, ThemeMenu } from "./ui";
import { InstallButton } from "./Pwa";
import { cn } from "../lib/utils";

const FAQS = [
  {
    q: "Is Chime really private and free of tracking?",
    a: "Yes. Chime was architected from day one without marketing trackers, analytics cookies, or behavioral profiling. Your communications happen directly over encrypted WebSocket channels authenticated by Clerk enterprise identity.",
  },
  {
    q: "Do I need to download Chime from an App Store?",
    a: "No. Chime is built as a state-of-the-art Progressive Web App (PWA). You can install it straight from your browser onto your iPhone home screen, Android device, macOS dock, or Windows taskbar with full offline support.",
  },
  {
    q: "How fast is message delivery?",
    a: "Typical message transit is under 20 milliseconds worldwide over dedicated persistent WebSockets, with automated reconnect, optimistic local cache, and zero artificial delays.",
  },
  {
    q: "Can I share high-resolution photos and videos?",
    a: "Yes. Chime supports direct media uploads up to 25 MB with inline visual previews, responsive image rendering, and video player support.",
  },
];

export default function AuthScreen({
  configured = true,
  offline = false,
  connectionError = false,
}) {
  const routeMode = () =>
    window.location.pathname.startsWith("/sign-up")
      ? "signup"
      : window.location.pathname.startsWith("/sign-in")
        ? "signin"
        : "welcome";

  const [mode, setMode] = useState(routeMode);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showcaseTab, setShowcaseTab] = useState("chat");

  useEffect(() => {
    const sync = () => setMode(routeMode());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    document.title =
      mode === "signin"
        ? "Sign in — Chime"
        : mode === "signup"
          ? "Create your account — Chime"
          : "Chime — A quieter place for conversations";
  }, [mode]);

  function navigate(next) {
    window.history.pushState(
      {},
      "",
      next === "signup" ? "/sign-up" : next === "signin" ? "/sign-in" : "/",
    );
    setMode(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Dedicated Centered Auth View
  if (mode === "signin" || mode === "signup") {
    return (
      <main className="relative flex min-h-dvh flex-col bg-background selection:bg-primary/20">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-80" />
        <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
          <Brand />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate("welcome")}
              className="gap-2"
            >
              <ArrowLeft size={15} />
              Back to Chime
            </Button>
            <ThemeMenu />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full text-center"
          >
            <div className="mb-6 flex justify-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                <MessageCircle size={28} />
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "signin"
                ? "Welcome back."
                : "Your next hello starts here."}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to catch up with your people."
                : "A quiet, distraction-free space for what matters."}
            </p>

            <div className="mt-8 rounded-3xl border border-border/80 bg-surface/80 p-3 shadow-xl backdrop-blur-2xl">
              {mode === "signin" ? (
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  forceRedirectUrl="/"
                />
              ) : (
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  forceRedirectUrl="/"
                />
              )}
            </div>

            <Button
              variant="ghost"
              className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New to Chime? Create an account"
                : "Already have an account? Sign in"}
            </Button>
          </motion.div>
        </div>

        <footer className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 text-xs text-muted-foreground sm:px-10 lg:px-16">
          <span>Protected by secure session encryption</span>
          <span className="text-[11px]">Chime • Less noise. More connection.</span>
        </footer>
      </main>
    );
  }

  // Welcome / Full Landing Page
  return (
    <main className="relative flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute inset-0 hero-glow opacity-90" />
      <div className="pointer-events-none absolute inset-0 chat-pattern opacity-40" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3.5 backdrop-blur-xl transition-all sm:px-8 lg:px-16">
        <Brand />
        <nav
          aria-label="Landing navigation"
          className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex"
        >
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#preview"
            className="transition-colors hover:text-foreground"
          >
            Interface
          </a>
          <a
            href="#comparison"
            className="transition-colors hover:text-foreground"
          >
            Why Chime
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">
            A little more connected.
          </span>
          <ThemeMenu />
          <Button
            size="small"
            className="gap-1.5 shadow-sm"
            onClick={() => navigate("signup")}
          >
            Get started
            <ArrowRight size={14} />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-4 pt-10 pb-16 text-center sm:px-8 lg:px-16 lg:pt-16 lg:pb-24">
        {/* Availability / Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-surface/85 px-4 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-xl"
        >
          <span
            role="status"
            aria-label="Available"
            className="relative flex size-2"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-status opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-status shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
            <span className="sr-only"> (Available)</span>
          </span>
          <span className="font-semibold text-primary">Chime 2.0</span>
          <span className="h-3 w-px bg-border" />
          <span className="text-muted-foreground">A quieter place to catch up</span>
        </motion.div>

        {/* Master Headline (Matches /Less noise/ expectation) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="max-w-4xl text-[clamp(2.35rem,6.5vw,4.75rem)] font-extrabold leading-[1.08] tracking-tight text-foreground sm:tracking-[-0.035em]"
        >
          Less noise.
          <br />
          <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-600 dark:from-primary dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            More connection.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          The private, blazing-fast personal messenger designed for the people
          who matter most. No feeds, no ads, zero algorithmic clutter — just
          calm, real-time conversations at your pace.
        </motion.p>

        {/* Status Messages (if offline or not configured) */}
        {!configured ? (
          <div
            role="alert"
            className="mt-8 w-full max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <strong>Clerk Setup Required</strong>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your Clerk publishable key to enable authentication.
            </p>
          </div>
        ) : offline || connectionError ? (
          <div
            role="status"
            className="mt-8 w-full max-w-md rounded-2xl border border-border bg-surface/90 p-5 shadow-lg backdrop-blur-xl"
          >
            <strong className="text-sm font-semibold">
              {offline ? "You’re offline" : "Connection unavailable"}
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The app is ready. Reconnect to sign in and load your conversations.
            </p>
            <Button
              variant="outline"
              size="small"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-9 flex w-full flex-col sm:flex-row items-center justify-center gap-3.5 sm:w-auto"
            >
              <Button
                size="default"
                className="h-12 w-full sm:w-auto gap-3 px-8 text-base shadow-lg transition-transform hover:scale-[1.02]"
                onClick={() => navigate("signup")}
              >
                Get started
                <ArrowRight size={18} />
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-12 w-full sm:w-auto px-7 text-base bg-surface/75 backdrop-blur-xl hover:bg-muted"
                onClick={() => navigate("signin")}
              >
                Sign in
              </Button>
            </motion.div>

            {/* Social Proof & Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-3">
                <span className="flex -space-x-2.5" aria-hidden="true">
                  {["Ari", "Sam", "Jo"].map((fullName) => (
                    <Avatar
                      key={fullName}
                      user={{ fullName }}
                      className="size-8 ring-2 ring-background"
                    />
                  ))}
                </span>
                <span className="font-medium text-foreground">
                  Your people. Your pace.
                </span>
              </div>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-primary" />
                <span>Zero algorithmic feeds</span>
              </div>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" />
                <span>Encrypted session tokens</span>
              </div>
            </motion.div>
          </>
        )}

        {/* Product Visual Showcase Window (High-End Interface Mockup) */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="relative mt-16 w-full max-w-5xl"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-primary/30 via-emerald-500/20 to-teal-500/30 blur-2xl opacity-50" />

          {/* Window Container */}
          <div className="relative overflow-hidden rounded-[28px] border border-border/90 bg-surface/90 shadow-2xl backdrop-blur-2xl text-left">
            {/* Window Title Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Showcase Capability Tabs */}
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-surface/90 p-1">
                <button
                  type="button"
                  onClick={() => setShowcaseTab("chat")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    showcaseTab === "chat"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Direct Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseTab("media")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    showcaseTab === "media"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Rich Media
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseTab("privacy")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    showcaseTab === "privacy"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Private &amp; Quiet
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-status animate-pulse" />
                <span className="hidden sm:inline">Online</span>
              </div>
            </div>

            {/* Inner App Interface Preview */}
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] min-h-[400px] bg-background/50">
              {/* Left Mini Sidebar Preview */}
              <div className="hidden md:flex flex-col border-r border-border/70 bg-sidebar/80 p-4">
                <div className="flex items-center justify-between pb-3">
                  <strong className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Conversations
                  </strong>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    3 active
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div
                    onClick={() => setShowcaseTab("chat")}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all shadow-xs",
                      showcaseTab === "chat" ? "bg-accent/90" : "hover:bg-muted/50",
                    )}
                  >
                    <Avatar user={{ fullName: "Taylor Reed" }} size="avatar-small" online />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Taylor Reed</span>
                        <span className="text-[10px] text-muted-foreground">2:22 PM</span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Let’s go back this weekend. Coffee’s on me ☕
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setShowcaseTab("media")}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all",
                      showcaseTab === "media" ? "bg-accent/90 shadow-xs" : "hover:bg-muted/50",
                    )}
                  >
                    <Avatar user={{ fullName: "Robin Vance" }} size="avatar-small" online />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Robin Vance</span>
                        <span className="text-[10px] text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Sent a photo 📷
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => setShowcaseTab("privacy")}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all",
                      showcaseTab === "privacy" ? "bg-accent/90 shadow-xs" : "hover:bg-muted/50",
                    )}
                  >
                    <Avatar user={{ fullName: "Chris Rivera" }} size="avatar-small" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Chris Rivera</span>
                        <span className="text-[10px] text-muted-foreground">Oct 12</span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Looking forward to catching up!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Mini Chat Feed Preview */}
              <div className="flex flex-col justify-between p-5 bg-surface/40">
                {/* Active Contact Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      user={{
                        fullName:
                          showcaseTab === "chat"
                            ? "Taylor Reed"
                            : showcaseTab === "media"
                              ? "Robin Vance"
                              : "Chris Rivera",
                      }}
                      size="avatar-small"
                      online={showcaseTab !== "privacy"}
                    />
                    <div>
                      <strong className="text-sm font-bold text-foreground">
                        {showcaseTab === "chat"
                          ? "Taylor Reed"
                          : showcaseTab === "media"
                            ? "Robin Vance"
                            : "Chris Rivera"}
                      </strong>
                      <p className="text-[11px] text-muted-foreground">
                        {showcaseTab === "chat"
                          ? "Active now • Encrypted channel"
                          : showcaseTab === "media"
                            ? "Online • High-speed attachments"
                            : "Verified Clerk identity • Private"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <Lock size={12} className="text-primary" />
                    <span className="hidden sm:inline">Encrypted</span>
                  </div>
                </div>

                {/* Dynamic Showcase Message Stream */}
                {showcaseTab === "chat" && (
                  <div className="space-y-3 py-4">
                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-xs border border-border/80 bg-surface/90 p-3 text-xs leading-relaxed text-foreground shadow-xs">
                        Hey! Did you find that little bookshop?
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">2:20 PM</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-primary p-3 text-xs leading-relaxed text-primary-foreground shadow-xs">
                        I did. It’s even better than you said.
                      </div>
                      <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                        <span>2:21 PM</span> • <Check size={11} className="text-primary" /> Sent
                      </span>
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-xs border border-border/80 bg-surface/90 p-3 text-xs leading-relaxed text-foreground shadow-xs">
                        Let’s go back this weekend. Coffee’s on me ☕
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">2:22 PM</span>
                    </div>
                  </div>
                )}

                {showcaseTab === "media" && (
                  <div className="space-y-3 py-4">
                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-xs border border-border/80 bg-surface/90 p-3 text-xs leading-relaxed text-foreground shadow-xs">
                        Sent you the high-resolution photo from our hike yesterday! 📷
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">Yesterday</span>
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-2 text-xs shadow-xs">
                        <div className="h-32 w-full rounded-xl bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-primary/40 flex items-center justify-center text-muted-foreground">
                          <ImageIcon size={32} className="text-primary/70" />
                        </div>
                        <div className="mt-2 flex items-center justify-between px-1">
                          <span className="font-semibold text-foreground">mountain_trail_4k.jpg</span>
                          <span className="text-[10px] text-muted-foreground">16.4 MB • Raw</span>
                        </div>
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">Yesterday</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-primary p-3 text-xs leading-relaxed text-primary-foreground shadow-xs">
                        Colors look unbelievable! Thank you.
                      </div>
                      <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                        <Check size={11} className="text-primary" /> Sent
                      </span>
                    </div>
                  </div>
                )}

                {showcaseTab === "privacy" && (
                  <div className="space-y-3 py-4">
                    <div className="rounded-2xl border border-primary/25 bg-accent/30 p-3.5 text-center text-xs">
                      <span className="font-semibold text-foreground">🔒 End-to-End WebSocket Session</span>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Authenticated with Clerk session tokens • Zero telemetry trackers
                      </p>
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-xs border border-border/80 bg-surface/90 p-3 text-xs leading-relaxed text-foreground shadow-xs">
                        No tracking cookies, no cross-site profiling, zero read anxiety.
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">Oct 12</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-primary p-3 text-xs leading-relaxed text-primary-foreground shadow-xs">
                        Pure private conversations at our own pace.
                      </div>
                      <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                        <Check size={11} className="text-primary" /> Sent
                      </span>
                    </div>
                  </div>
                )}

                {/* Mockup Composer */}
                <div
                  onClick={() => navigate("signup")}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-4 py-2 text-xs text-muted-foreground shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="truncate">Sign in or create an account to start chatting…</span>
                  <span className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Feature Pills Around Window */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-4 py-2 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xl">
              <Zap size={14} className="text-amber-500" />
              <span>&lt; 15ms WebSocket Delivery</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-4 py-2 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xl">
              <ShieldCheck size={14} className="text-primary" />
              <span>Zero Algorithms &amp; Ad Trackers</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-4 py-2 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xl">
              <Smartphone size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Native PWA • iPhone, Android &amp; Desktop</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        id="features"
        className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-20 sm:px-8 lg:px-16"
      >
        <div className="text-center">
          <span className="rounded-full border border-primary/25 bg-surface/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-xs">
            Built for human connection
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Engineered from the ground up to respect your attention and deliver
            lightning-fast everyday messaging.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "Instant Real-Time Sync",
              description:
                "Zero-lag WebSockets deliver your words the instant they leave your keyboard with live active presence and automated reconnect.",
              tag: "< 15ms latency",
              gradient: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
              preview: (
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-2.5 text-xs text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-status opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-status shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                  </span>
                  <span className="font-mono text-[11px] font-bold text-foreground">12ms ping</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="truncate text-[11px]">Persistent socket</span>
                </div>
              ),
            },
            {
              icon: ImageIcon,
              title: "Rich Media & Files",
              description:
                "Drop full-resolution photos, videos, and attachments directly into conversations with client-side validation and instant previews.",
              tag: "Up to 25 MB",
              gradient: "from-purple-500/20 to-indigo-500/10 text-purple-600 dark:text-purple-400",
              preview: (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  <span className="rounded-xl border border-border/70 bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground">
                    📷 Photos
                  </span>
                  <span className="rounded-xl border border-border/70 bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground">
                    🎥 Video
                  </span>
                  <span className="rounded-xl border border-border/70 bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground">
                    📎 25 MB
                  </span>
                </div>
              ),
            },
            {
              icon: ShieldCheck,
              title: "Quiet & Private",
              description:
                "No read-receipt pressure, zero profiling, and no advertising trackers. Your conversations stay strictly between you and your circle.",
              tag: "Zero ads",
              gradient: "from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400",
              preview: (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  <span className="rounded-xl border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-semibold text-primary">
                    ✓ Zero trackers
                  </span>
                  <span className="rounded-xl border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-semibold text-primary">
                    ✓ No read anxiety
                  </span>
                </div>
              ),
            },
            {
              icon: Smartphone,
              title: "Installable Everywhere",
              description:
                "Install on your iPhone home screen, Android phone, or desktop. Native PWA performance with resilient offline caching.",
              tag: "Cross-platform",
              gradient: "from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400",
              preview: (
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-2.5 text-[11px] font-medium text-foreground">
                  <span>iOS • Android</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="font-semibold">macOS • PC</span>
                </div>
              ),
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-surface/75 p-7 shadow-xs backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xs transition-transform duration-200 group-hover:scale-105",
                      feature.gradient,
                    )}
                  >
                    <feature.icon size={22} />
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </div>
              {feature.preview}
            </div>
          ))}
        </div>
      </section>

      {/* Performance & Metrics Strip */}
      <section
        id="performance"
        className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 lg:px-16"
      >
        <div className="rounded-3xl border border-border/80 bg-surface/60 p-8 shadow-xs backdrop-blur-xl sm:p-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { stat: "< 20ms", label: "WebSocket latency", desc: "Sub-frame worldwide transit" },
              { stat: "100%", label: "Private & direct", desc: "Zero third-party ad brokers" },
              { stat: "Zero", label: "Algorithmic noise", desc: "Pure chronological order" },
              { stat: "Offline", label: "Resilient cache", desc: "Instant startup and message queue" },
            ].map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  {metric.stat}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                  {metric.label}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {metric.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: Why Chime vs Traditional Social Messengers */}
      <section
        id="comparison"
        className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-8 lg:px-16"
      >
        <div className="text-center">
          <span className="rounded-full border border-primary/25 bg-surface/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-xs">
            A Better Philosophy
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Why people choose Chime
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A clear look at how Chime eliminates the noise common in modern apps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional Apps */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 p-7 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 text-sm font-bold text-destructive">
              <span className="flex size-7 items-center justify-center rounded-full bg-destructive/10">
                ✕
              </span>
              <span>Traditional Messengers</span>
            </div>
            <ul className="mt-6 space-y-3.5 text-xs text-muted-foreground sm:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="text-destructive font-bold">•</span>
                <span>Cluttered algorithmic feeds and sponsored brand channels</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-destructive font-bold">•</span>
                <span>Behavioral ad tracking and cross-site data harvesting</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-destructive font-bold">•</span>
                <span>Social anxiety from intrusive "read" and "typing" receipts</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-destructive font-bold">•</span>
                <span>Heavy app store downloads and constant forced updates</span>
              </li>
            </ul>
          </div>

          {/* Chime Experience */}
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-accent/50 via-surface to-accent/30 p-7 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-bold text-primary">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  ✓
                </span>
                <span>The Chime Experience</span>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                The Chime Standard
              </span>
            </div>
            <ul className="mt-6 space-y-3.5 text-xs text-foreground sm:text-sm font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Zero algorithmic feeds — pure, direct human messaging</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Zero marketing trackers and protected Clerk session tokens</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Calm presence without invasive surveillance or pressure</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Instant PWA installation across iOS, Android, and Desktop</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Platform & Installation Banner (Contains InstallButton for tests) */}
      <section className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-accent/70 via-surface to-accent/40 p-8 shadow-lg backdrop-blur-xl md:flex-row md:p-12">
          <div className="max-w-xl text-center md:text-left">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              Progressive Web App
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              One tap away on all your screens
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add Chime to your mobile home screen or desktop taskbar. Runs
              instantly, works offline, and requires zero app store updates.
            </p>
          </div>
          <div className="w-full max-w-xs shrink-0">
            <InstallButton />
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section
        id="faq"
        className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 sm:px-8"
      >
        <div className="text-center">
          <span className="rounded-full border border-primary/25 bg-surface/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-xs">
            Got Questions?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border/80 bg-surface/75 backdrop-blur-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/60 px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-16 text-center sm:px-8 lg:px-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface to-accent/25 p-10 shadow-xl backdrop-blur-2xl sm:p-16">
          <div className="pointer-events-none absolute -inset-2 hero-glow opacity-70" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready for a calmer way to stay in touch?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join people enjoying private, noise-free conversations. No download required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="default"
                className="h-12 px-8 text-base shadow-lg hover:scale-[1.02]"
                onClick={() => navigate("signup")}
              >
                Get started for free
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="relative z-10 mt-auto border-t border-border/60 bg-surface/40 py-8 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-6 px-4 text-xs text-muted-foreground sm:flex-row sm:px-8 lg:px-16">
          <div className="flex items-center gap-3">
            <Brand small />
            <span className="text-muted-foreground/60">•</span>
            <span>Made for real conversations.</span>
          </div>

          <div className="flex items-center gap-4">
            <InstallButton compact />
            <span className="hidden sm:inline text-muted-foreground/60">•</span>
            <span className="hidden sm:inline">Slow down. Stay close.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
