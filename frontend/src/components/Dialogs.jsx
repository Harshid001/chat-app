import { useEffect, useState } from "react";
import { useClerk } from "@clerk/react";
import {
  ArrowUpRight,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { usePreferences } from "../stores/preferences";
import {
  Avatar,
  Button,
  ErrorNotice,
  IconButton,
  Input,
  Modal,
  SegmentedControl,
  Spinner,
} from "./ui";
import { InstallButton } from "./Pwa";

export function NewConversation({ onClose }) {
  const [query, setQuery] = useState("");
  const {
    users,
    usersLoading,
    usersError,
    loadUsers,
    selectConversation,
    onlineUsers,
  } = useChat();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((user) =>
    user.fullName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal
      title="New message"
      description="Good conversations start with a hello."
      onClose={onClose}
    >
      <div className="relative mt-2">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-3.5 z-10 text-muted-foreground"
        />
        <Input
          autoFocus
          placeholder="Search people"
          aria-label="Search people"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 bg-surface/70 pl-10 pr-9 text-xs sm:text-xs"
        />
        {query && (
          <IconButton
            label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-1 top-0 size-10"
          >
            <X size={14} />
          </IconButton>
        )}
      </div>

      <div className="mb-2 mt-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>People on Chime</span>
        <span className="tabular-nums">{filtered.length}</span>
      </div>

      <div className="-mx-2 max-h-[48dvh] min-h-40 overflow-y-auto px-1 py-1">
        {usersError && <ErrorNotice message={usersError} onRetry={loadUsers} />}
        {usersLoading ? (
          <Spinner label="Finding people…" />
        ) : filtered.length ? (
          filtered.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            return (
              <button
                key={user._id}
                onClick={() => {
                  selectConversation(user);
                  onClose();
                }}
                className="group flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left transition-all duration-150 active:scale-[0.99] hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar user={user} online={isOnline} />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
                    {user.fullName}
                  </strong>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {isOnline ? "Online now" : "Start a conversation"}
                  </span>
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-surface text-muted-foreground shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight size={15} />
                </span>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-surface text-muted-foreground shadow-xs">
              <UserRound size={24} />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {query ? "No matches yet" : "Your people belong here"}
            </h3>
            <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
              {query
                ? "Try a different name."
                : "Share Chime with a friend. You can message them as soon as they join."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function Settings({ onClose }) {
  const { profile, reset } = useChat();
  const { theme, setTheme } = usePreferences();
  const { openUserProfile, signOut } = useClerk();
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    try {
      await signOut();
      reset();
    } catch {
      setError("Couldn’t sign out. Please try again.");
      setLeaving(false);
    }
  }

  return (
    <Modal
      title="Your space"
      description="A few things to make Chime feel like you."
      onClose={onClose}
    >
      {/* Profile Card */}
      <div className="my-5 flex items-center gap-4 rounded-2xl border border-border/80 bg-surface/75 p-4 shadow-xs backdrop-blur-xl">
        <Avatar user={profile} size="avatar-large" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-foreground">
            {profile?.fullName}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {profile?.email}
          </p>
          <Button
            variant="ghost"
            size="small"
            className="-ml-3 mt-1.5 h-7 gap-1 text-xs text-primary font-medium hover:bg-muted"
            onClick={() => {
              onClose();
              openUserProfile();
            }}
          >
            Manage account
            <ArrowUpRight size={13} />
          </Button>
        </div>
      </div>

      {/* Appearance Section */}
      <section className="border-t border-border/80 py-5">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <p className="mb-3.5 mt-0.5 text-xs text-muted-foreground">
          Choose your interface theme.
        </p>
        <SegmentedControl
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ]}
        />
      </section>

      {/* Install App Section */}
      <section className="border-t border-border/80 py-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Chime, wherever you are
        </h3>
        <InstallButton />
        <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
          Your messages stay private to your account. Signing out clears this
          device’s open conversations.
        </p>
      </section>

      {error && <ErrorNotice message={error} />}

      {/* Sign Out Button */}
      <Button
        variant="danger"
        className="w-full h-11 gap-2 shadow-xs"
        disabled={leaving}
        onClick={logout}
      >
        <LogOut size={16} />
        {leaving ? "Signing out…" : "Sign out"}
      </Button>
    </Modal>
  );
}
