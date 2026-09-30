import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Monitor,
  Share,
  Smartphone,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, IconButton, Modal } from "./ui";
import { usePwa } from "../stores/pwa";
import { cn } from "../lib/utils";

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-5 left-1/2 z-[80] flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border bg-surface/90 py-2 pl-5 pr-2 text-xs shadow-lg backdrop-blur-xl"
      role="status"
    >
      <span>A new Chime is ready.</span>
      <Button size="small" onClick={() => updateServiceWorker(true)}>
        Update
      </Button>
      <IconButton label="Update later" onClick={() => setNeedRefresh(false)}>
        <X size={16} />
      </IconButton>
    </motion.div>
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
        onClick={install}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-surface/60 px-3.5 py-3 text-left backdrop-blur-lg transition-colors hover:bg-muted",
          compact && "w-auto rounded-full px-4 py-2.5",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ArrowDownToLine size={16} />
        </span>
        <span className="flex-1">
          <strong className="block text-xs font-medium">
            Get Chime for your device
          </strong>
          {!compact && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Your conversations, one tap away.
            </span>
          )}
        </span>
        {!compact && (
          <ArrowUpRight size={15} className="text-muted-foreground" />
        )}
      </button>
      {instructions && (
        <Modal
          title="Make room for Chime"
          description="Add Chime to your home screen for easy access."
          onClose={() => setInstructions(false)}
        >
          <div className="space-y-5">
            {[
              [
                "iPhone & iPad",
                Smartphone,
                <>
                  Open in Safari, tap <Share size={13} className="inline" />{" "}
                  <strong>Share</strong>, then{" "}
                  <strong>Add to Home Screen</strong>.
                </>,
              ],
              [
                "Android",
                Smartphone,
                <>
                  In Chrome’s menu, choose <strong>Install app</strong> or{" "}
                  <strong>Add to Home screen</strong>.
                </>,
              ],
              [
                "Desktop",
                Monitor,
                <>
                  Choose the install icon in Chrome or Edge’s address bar, or
                  look in the browser menu.
                </>,
              ],
            ].map(([title, Icon, copy]) => (
              <section key={title} className="flex gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-background">
                  <Icon size={19} className="text-muted-foreground" />
                </span>
                <div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </div>
              </section>
            ))}
          </div>
          <p className="mt-6 border-t pt-4 text-[11px] leading-relaxed text-muted-foreground">
            Available on supported browsers over a secure connection.
          </p>
        </Modal>
      )}
    </>
  );
}
