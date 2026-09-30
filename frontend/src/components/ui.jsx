import { Component, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  X,
} from "lucide-react";

export function Avatar({ user, size = "", online = false }) {
  const [failed, setFailed] = useState(false);
  const name = user?.fullName || "You";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  const color =
    [...name].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return (
    <span className={`avatar avatar-${color} ${size}`}>
      {user?.profilePic && !failed ? (
        <img
          src={user.profilePic}
          alt=""
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
      {online && <span className="presence" aria-label="Online" />}
    </span>
  );
}
export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Brand({ small = false }) {
  return (
    <span className={`brand ${small ? "brand-small" : ""}`}>
      <span className="brand-icon">
        <MessageCircle size={small ? 19 : 25} strokeWidth={2.1} />
      </span>
      <span>
        murmur<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
export function Spinner({ label = "Loading…" }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="animate-spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={17} />
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
export function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal glass ${className}`}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (
          event.target === ref.current &&
          (event.clientX < ref.current.getBoundingClientRect().left ||
            event.clientX > ref.current.getBoundingClientRect().right ||
            event.clientY < ref.current.getBoundingClientRect().top ||
            event.clientY > ref.current.getBoundingClientRect().bottom)
        )
          onClose();
      }}
    >
      <header className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </header>
      {children}
    </dialog>
  );
}
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Application error:", error);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal-screen">
          <Brand />
          <h1>Let’s try that again.</h1>
          <p>
            Something interrupted the app. Reload to get back to your
            conversations.
          </p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </main>
      );
    return this.props.children;
  }
}
