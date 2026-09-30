import { SignIn, SignUp } from "@clerk/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCheck,
  Ellipsis,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Avatar, Brand, Button, ThemeMenu } from "./ui";
import { InstallButton } from "./Pwa";
import { cn } from "../lib/utils";

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
  const [previewMessages, setPreviewMessages] = useState([
    { id: 1, mine: false, text: "Same place, same time?" },
    { id: 2, mine: true, text: "Wouldn’t miss it." },
    { id: 3, mine: false, text: "I have so much to tell you." },
    { id: 4, mine: true, text: "I’m all ears. Coffee’s on me." },
  ]);
  const [previewInput, setPreviewInput] = useState("");
  const [alexTyping, setAlexTyping] = useState(false);

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
          : "Chime — A little more connected";
  }, [mode]);

  function handleSendPreview(textToSend) {
    const text = (textToSend || previewInput).trim();
    if (!text) return;
    setPreviewMessages((prev) => [
      ...prev,
      { id: Date.now(), mine: true, text },
    ]);
    setPreviewInput("");
    setAlexTyping(true);
    setTimeout(() => {
      setAlexTyping(false);
      const responses = [
        "Sounds like a plan! See you there 😊",
        "Always good catching up with you 🌿",
        "Can't wait! Coffee's on you next time ☕",
        "Looking forward to it! Have a good one ✨",
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setPreviewMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, mine: false, text: reply },
      ]);
    }, 700);
  }

  function navigate(next) {
    window.history.pushState(
      {},
      "",
      next === "signup" ? "/sign-up" : next === "signin" ? "/sign-in" : "/",
    );
    setMode(next);
  }
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <Brand />
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-muted-foreground sm:block">
            A little more connected.
          </span>
          <ThemeMenu />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-14 px-6 py-10 sm:px-10 md:grid-cols-[1fr_1.08fr] lg:gap-20 lg:px-16 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-[460px] md:mx-0"
        >
          {mode === "welcome" || !configured || offline || connectionError ? (
            <>
              <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/75 py-2 pl-3 pr-4 text-xs font-medium text-foreground/85 shadow-xs backdrop-blur-xl">
                <span
                  role="status"
                  aria-label="Available"
                  className="size-1.5 rounded-full bg-status"
                >
                  <span className="sr-only"> (Available)</span>
                </span>
                A quieter place to catch up
              </span>
              <h1 className="text-[clamp(2.1rem,4vw,3.25rem)] font-medium leading-[1.16] tracking-tight sm:tracking-[-0.03em]">
                Less noise.
                <br />
                <span className="whitespace-nowrap text-primary">
                  More connection.
                </span>
              </h1>
              <p className="mt-6 max-w-[340px] text-sm leading-7 text-muted-foreground sm:text-[15px]">
                For the everyday updates, the weekend plans, and the people who
                make it all better.
              </p>
              {!configured ? (
                <div
                  role="alert"
                  className="mt-7 rounded-2xl border bg-surface/70 p-4 text-sm"
                >
                  <strong>Almost ready</strong>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Add your Clerk publishable key to enable sign in.
                  </p>
                </div>
              ) : offline || connectionError ? (
                <div
                  role="status"
                  className="mt-7 rounded-2xl border bg-surface/70 p-5"
                >
                  <strong className="text-sm">
                    {offline ? "You’re offline" : "Connection unavailable"}
                  </strong>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    The app is ready. Reconnect to sign in and load your
                    conversations.
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
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button
                      className="h-12 gap-5 px-6"
                      onClick={() => navigate("signup")}
                    >
                      Get started
                      <ArrowRight size={17} />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 bg-surface/60 backdrop-blur-xl"
                      onClick={() => navigate("signin")}
                    >
                      Sign in
                    </Button>
                  </div>
                  <div className="mt-9 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex -space-x-2" aria-hidden="true">
                      {["Ari", "Sam", "Jo"].map((fullName) => (
                        <Avatar
                          key={fullName}
                          user={{ fullName }}
                          className="size-7 ring-[3px] ring-background"
                        />
                      ))}
                    </span>
                    <span>Your people. Your pace.</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="small"
                className="-ml-3 mb-7"
                onClick={() => navigate("welcome")}
              >
                <ArrowLeft size={15} />
                Back to Chime
              </Button>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight">
                {mode === "signin"
                  ? "Welcome back."
                  : "Your next hello starts here."}
              </h1>
              <p className="mb-7 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Good to have you here."
                  : "A little space for your favorite people."}
              </p>
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
              <Button
                variant="ghost"
                className="mt-4 w-full text-xs"
                onClick={() =>
                  navigate(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin"
                  ? "New to Chime? Create an account"
                  : "Already here? Sign in"}
              </Button>
            </>
          )}
        </motion.section>
        <section
          className="relative flex min-h-[460px] items-center justify-center rounded-[32px] border border-border/60 bg-accent/45 px-4 py-10 sm:min-h-[560px] sm:px-7"
          aria-label="Interactive conversation preview"
        >
          <div className="absolute inset-0 rounded-[32px] opacity-55 chat-pattern" />
          <span className="absolute left-6 top-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[.1em] text-muted-foreground">
            <MessageCircle size={14} />
            Life, in the little messages
          </span>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="relative w-full max-w-[380px] overflow-hidden rounded-3xl border border-white/60 bg-surface/85 shadow-[0_16px_50px_-24px_rgba(22,44,29,.25)] backdrop-blur-2xl dark:border-border"
          >
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
              <Avatar user={{ fullName: "Alex" }} size="avatar-small" online />
              <div className="flex-1">
                <strong className="text-sm font-semibold">Alex</strong>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {alexTyping ? "Typing a thought…" : "Online now"}
                </p>
              </div>
              <Ellipsis size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-3 px-5 pb-4 pt-4 max-h-[300px] overflow-y-auto">
              <p className="pb-1 text-center text-xs text-muted-foreground">
                A quiet everyday catch-up
              </p>
              {previewMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col",
                    msg.mine ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "w-fit max-w-[85%] rounded-[20px] px-3.5 py-2.5 text-xs leading-relaxed transition-all",
                      msg.mine
                        ? "rounded-br-md bg-primary text-primary-foreground shadow-xs"
                        : "rounded-bl-md border border-border/70 bg-surface/90 text-foreground",
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {alexTyping && (
                <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 w-fit text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">Alex is typing</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-muted-foreground font-medium">
                <CheckCheck size={13} className="text-primary" />
                The start of a good day
              </div>
            </div>
            <div className="px-4 pb-2 pt-1 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-wider font-semibold">Try:</span>
              {[
                "Coffee later? ☕",
                "How are you doing? 🌿",
                "Have a wonderful day! ☀️",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendPreview(chip)}
                  className="shrink-0 text-[11px] rounded-full border border-border/80 bg-surface/70 px-2.5 py-1 text-muted-foreground transition-all duration-150 active:scale-95 hover:bg-muted hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPreview();
              }}
              className="mx-4 mb-4 flex items-center gap-2 rounded-full border border-border/80 bg-surface/75 p-1.5 shadow-xs transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15"
            >
              <input
                type="text"
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                placeholder="Say hello to test…"
                className="flex-1 bg-transparent px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Send test message to Alex in preview"
              />
              <button
                type="submit"
                aria-label="Send message in preview"
                disabled={!previewInput.trim()}
                className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-150 active:scale-95 hover:bg-primary/90 disabled:opacity-40"
              >
                <ArrowUp size={15} strokeWidth={2.2} />
              </button>
            </form>
          </motion.div>
          <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/75 px-4 py-2.5 text-xs text-muted-foreground shadow-xs backdrop-blur-xl">
            <Heart size={13} className="text-primary fill-primary/20" />
            A little hello goes a long way.
          </span>
        </section>
      </div>
      <footer className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-6 text-[11px] text-muted-foreground sm:px-10 lg:px-16">
        <span>Made for real conversations.</span>
        <InstallButton compact />
        <span className="hidden sm:block">Slow down. Stay close.</span>
      </footer>
    </main>
  );
}
