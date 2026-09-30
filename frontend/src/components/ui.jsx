import { Component, useRef, useState } from "react";
import {
  Avatar as AvatarPrimitive,
  Dialog,
  DropdownMenu,
  Slot,
  ToggleGroup,
  Tooltip,
} from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  MessagesSquare,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { usePreferences } from "../stores/preferences";

export function Button({
  variant = "primary",
  size = "default",
  asChild = false,
  className,
  children,
  ...props
}) {
  const Tag = asChild ? Slot.Root : "button";
  return (
    <Tag
      type={asChild ? undefined : "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0",
        {
          "border border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90":
            variant === "primary",
          "border border-border bg-surface text-foreground shadow-xs hover:bg-muted":
            variant === "outline",
          "text-muted-foreground hover:bg-muted hover:text-foreground":
            variant === "ghost",
          "bg-accent text-accent-foreground hover:bg-accent/75":
            variant === "soft",
          "border border-destructive/20 text-destructive hover:bg-destructive/5":
            variant === "danger",
          "h-11 px-4": size === "default",
          "h-9 rounded-full px-3 text-xs": size === "small",
          "size-10 p-0": size === "icon",
        },
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
export function IconButton({ label, children, className, ...props }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={className}
          {...props}
        >
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={7}
          className="z-[80] rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-sm animate-popover"
        >
          {label}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-full border border-border bg-surface/75 px-3.5 backdrop-blur-xl text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/15 disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-11 w-full resize-none rounded-xl bg-transparent px-2 py-3 text-base leading-6 outline-none placeholder:text-muted-foreground md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function Avatar({ user, size = "", online = false, className }) {
  const name = user?.fullName || "You";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  const tone = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return (
    <span
      className={cn(
        "relative inline-flex size-11 shrink-0",
        size === "avatar-small" && "size-10",
        size === "avatar-large" && "size-16",
        className,
      )}
    >
      <AvatarPrimitive.Root
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-full text-sm font-medium ring-1 ring-black/5 dark:ring-white/10",
          [
            "bg-[#e2e9df] text-[#4b6544]",
            "bg-[#e4e6ed] text-[#586178]",
            "bg-[#eddfd5] text-[#866450]",
            "bg-[#e9e2d0] text-[#7c704b]",
          ][tone],
          size === "avatar-large" && "text-xl",
        )}
      >
        <AvatarPrimitive.Image
          src={user?.profilePic || undefined}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
        <AvatarPrimitive.Fallback>{initials}</AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {online && (
        <span
          aria-label="Online"
          className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface bg-status"
        />
      )}
    </span>
  );
}
export function Brand({ small = false, iconOnly = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[25px] font-semibold tracking-[-1.2px]",
        small && "text-xl",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-[13px] bg-primary text-primary-foreground",
          small && "size-9 rounded-xl",
        )}
      >
        <MessagesSquare size={small ? 19 : 22} strokeWidth={1.8} />
      </span>
      {!iconOnly && (
        <span>
          chime<span className="text-primary">.</span>
        </span>
      )}
      {iconOnly && <span className="sr-only">Chime</span>}
    </span>
  );
}
export function Spinner({ label = "Loading…" }) {
  return (
    <div
      className="flex items-center justify-center gap-2.5 px-4 py-10 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle className="animate-spin" size={18} />
      <span>{label}</span>
    </div>
  );
}
export function ErrorNotice({ message, onRetry }) {
  return (
    <div
      className="my-3 flex items-center gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
      role="alert"
    >
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="small"
          className="text-destructive"
          onClick={onRetry}
        >
          <RefreshCw size={13} />
          Retry
        </Button>
      )}
    </div>
  );
}
export function Modal({ title, description, children, onClose, className }) {
  const [open, setOpen] = useState(true);
  const previousFocus = useRef(document.activeElement);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence onExitComplete={onClose}>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              asChild
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                previousFocus.current?.focus();
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-surface/90 p-6 backdrop-blur-2xl text-foreground shadow-xl outline-none sm:p-7",
                  className,
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold tracking-tight">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description
                      className={
                        description
                          ? "mt-1.5 text-sm leading-relaxed text-muted-foreground"
                          : "sr-only"
                      }
                    >
                      {description || title}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close dialog"
                      className="-mr-2 -mt-2"
                    >
                      <X size={19} />
                    </Button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
export function SegmentedControl({
  value,
  onChange,
  options,
  label,
  className,
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      aria-label={label}
      className={cn(
        "flex gap-1 rounded-full border border-border/70 bg-muted/60 p-1 backdrop-blur-xl",
        className,
      )}
    >
      {options.map(({ value: key, label: text, icon: Icon, count }) => (
        <ToggleGroup.Item
          key={key}
          value={key}
          className="relative flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-surface data-[state=on]:text-foreground data-[state=on]:shadow-xs"
        >
          {Icon && <Icon size={16} />}
          {text}
          {count > 0 && (
            <span className="rounded-md bg-background px-1.5 py-0.5 text-[10px] tabular-nums">
              {count}
            </span>
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
export function ThemeMenu() {
  const { theme, setTheme } = usePreferences();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton label="Choose appearance">
          {theme === "dark" ? (
            <Moon size={20} />
          ) : theme === "light" ? (
            <Sun size={20} />
          ) : (
            <Monitor size={20} />
          )}
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-[70] min-w-44 rounded-xl border border-border bg-surface/90 p-1.5 shadow-lg backdrop-blur-2xl animate-popover"
        >
          <DropdownMenu.Label className="px-2.5 py-2 text-[11px] font-medium text-muted-foreground">
            Appearance
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            {[
              ["light", Sun, "Light"],
              ["dark", Moon, "Dark"],
              ["system", Monitor, "System"],
            ].map(([value, Icon, name]) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm outline-none focus:bg-muted"
              >
                <Icon size={16} />
                {name}
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Check size={14} />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
        <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
          <Brand />
          <h1 className="text-2xl font-semibold tracking-tight">
            Let’s try that again.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Something interrupted the app. Reload to get back to your
            conversations.
          </p>
          <Button onClick={() => window.location.reload()}>Reload app</Button>
        </main>
      );
    return this.props.children;
  }
}
