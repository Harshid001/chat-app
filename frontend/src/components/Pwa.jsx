import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { IconButton, Modal } from "./ui";
import { usePwa } from "../stores/pwa";

export function PwaUpdates() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn("Offline support unavailable:", error);
    },
  });
  if (!needRefresh) return null;
  return (
    <div className="update-toast" role="status">
      <span>A fresh version is ready.</span>
      <button onClick={() => updateServiceWorker(true)}>Update</button>
      <IconButton label="Update later" onClick={() => setNeedRefresh(false)}>
        <X size={17} />
      </IconButton>
    </div>
  );
}

export function InstallButton({ compact = false }) {
  const { prompt, installed } = usePwa();
  const [instructions, setInstructions] = useState(false);
  async function install() {
    if (!prompt) {
      setInstructions(true);
      return;
    }
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setInstructions(true);
    } finally {
      usePwa.setState({ prompt: null });
    }
  }
  if (installed) return null;
  return (
    <>
      <button
        className={compact ? "install-compact" : "install-card"}
        onClick={install}
      >
        <span className="install-icon">
          <Download size={18} />
        </span>
        <span>
          <strong>Take murmur with you</strong>
          {!compact && <small>Install the app. Stay a little closer.</small>}
        </span>
        {!compact && <PlusSquare size={16} />}
      </button>
      {instructions && (
        <Modal
          title="At home on your home screen"
          onClose={() => setInstructions(false)}
        >
          <div className="install-help">
            <Smartphone size={36} />
            <p>Keep your conversations one tap away.</p>
            <h3>iPhone & iPad</h3>
            <p>
              Open this site in Safari, tap{" "}
              <Share size={15} aria-label="Share" /> <strong>Share</strong>,
              then <strong>Add to Home Screen</strong>.
            </p>
            <h3>Android</h3>
            <p>
              Open this site in Chrome, tap the menu, then{" "}
              <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
            <h3>Desktop</h3>
            <p>
              In Chrome or Edge, choose the install icon in the address bar. If
              it isn’t available, use the browser menu.
            </p>
            <p className="muted text-sm">
              Installation requires a secure connection and a supported browser.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
