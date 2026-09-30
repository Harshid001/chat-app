import { SignIn, SignUp } from "@clerk/react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MessageCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Brand, IconButton } from "./ui";
import { InstallButton } from "./Pwa";
import { usePreferences } from "../stores/preferences";

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
  useEffect(() => {
    const sync = () => setMode(routeMode());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function navigate(next) {
    window.history.pushState(
      {},
      "",
      next === "signup" ? "/sign-up" : next === "signin" ? "/sign-in" : "/",
    );
    setMode(next);
  }
  const theme = usePreferences((state) => state.theme);
  const setTheme = usePreferences((state) => state.setTheme);
  return (
    <main className="welcome-page">
      <header className="welcome-nav">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="nav-caption">
            A little closer, wherever you are.
          </span>
          <IconButton
            label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
        </div>
      </header>
      <section className="welcome-content">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span /> MADE FOR YOUR EVERYDAY
          </div>
          <h1>
            Good conversations.
            <br />
            <span>Closer connections.</span>
          </h1>
          <p>
            A thought, a photo, a little hello.
            <br />A quiet space for the people who make your day.
          </p>
          {!configured ? (
            <div className="setup-notice" role="alert">
              <strong>Almost ready to connect</strong>
              <p>
                Add your Clerk publishable key to the deployment to enable sign
                in.
              </p>
            </div>
          ) : offline || connectionError ? (
            <div className="setup-notice" role="status">
              <strong>
                {offline ? "You’re offline" : "Connection unavailable"}
              </strong>
              <p>
                The app is ready. Reconnect to sign in and load your
                conversations.
              </p>
              <button
                className="text-button mt-3"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : mode === "welcome" ? (
            <>
              <div className="welcome-actions">
                <button
                  className="primary-button"
                  onClick={() => navigate("signup")}
                >
                  Find your people <ArrowUpRight size={18} />
                </button>
                <button
                  className="text-button"
                  onClick={() => navigate("signin")}
                >
                  Sign in <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="welcome-note">
                Your next conversation starts here.
              </p>
            </>
          ) : (
            <div className="auth-form">
              <button
                className="text-button back-auth"
                onClick={() => navigate("welcome")}
              >
                <ArrowLeft size={16} /> Back
              </button>
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
              <button
                className="text-button auth-switch"
                onClick={() =>
                  navigate(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="conversation-preview glass">
            <div className="preview-header">
              <span className="preview-avatar">J</span>
              <div>
                <strong>Just saying hello</strong>
                <small>Little moments. Real connections.</small>
              </div>
              <MessageCircle size={21} />
            </div>
            <div className="preview-day">A LITTLE CONVERSATION</div>
            <div className="preview-bubble incoming">
              Hey, you. Got a minute?
            </div>
            <div className="preview-bubble outgoing">For you? Always.</div>
            <div className="preview-bubble incoming">
              Some things are better shared.
            </div>
            <div className="preview-bubble outgoing">
              Couldn’t agree more <Sun size={12} className="inline" />
            </div>
            <div className="preview-delivered">
              <Check size={12} /> A little closer
            </div>
            <div className="preview-composer">
              <span>Something on your mind?</span>
              <span className="preview-send">
                <ArrowUpRight size={17} />
              </span>
            </div>
          </div>
          <div className="art-note glass">
            <span className="note-dot" /> Small messages. Big feelings.
          </div>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>A space to stay connected.</span>
        <InstallButton compact />
        <span className="footer-wordmark">LESS NOISE. MORE YOU.</span>
      </footer>
    </main>
  );
}
