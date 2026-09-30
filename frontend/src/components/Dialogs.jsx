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
} from "lucide-react";
import { useChat } from "../stores/chat";
import { usePreferences } from "../stores/preferences";
import {
  Avatar,
  Button,
  ErrorNotice,
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
      <div className="relative">
        <Search
          size={17}
          className="absolute left-3.5 top-3.5 z-10 text-muted-foreground"
        />
        <Input
          autoFocus
          placeholder="Search people"
          aria-label="Search people"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-10"
        />
      </div>
      <p className="mb-2 mt-6 text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">
        People on Chime
      </p>
      <div className="-mx-2 max-h-[45dvh] min-h-40 overflow-y-auto">
        {usersError && <ErrorNotice message={usersError} onRetry={loadUsers} />}
        {usersLoading ? (
          <Spinner label="Finding people…" />
        ) : filtered.length ? (
          filtered.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                selectConversation(user);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-muted"
            >
              <Avatar user={user} online={onlineUsers.includes(user._id)} />
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-medium">
                  {user.fullName}
                </strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {onlineUsers.includes(user._id)
                    ? "Online now"
                    : "Start a conversation"}
                </span>
              </span>
              <ArrowUpRight size={17} className="text-muted-foreground" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <UserRound size={27} className="text-muted-foreground" />
            <h3 className="text-sm font-medium">
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
      <div className="my-6 flex items-center gap-4 rounded-2xl border bg-background/60 p-4">
        <Avatar user={profile} size="avatar-large" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            {profile?.fullName}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {profile?.email}
          </p>
          <Button
            variant="ghost"
            size="small"
            className="-ml-3 mt-1 h-8 text-primary"
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
      <section className="border-t py-5">
        <h3 className="text-sm font-medium">Appearance</h3>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">
          Find your light.
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
      <section className="border-t py-5">
        <h3 className="mb-3 text-sm font-medium">Chime, wherever you are</h3>
        <InstallButton />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Your messages stay private to your account. Signing out clears this
          device’s open conversations.
        </p>
      </section>
      {error && <ErrorNotice message={error} />}
      <Button
        variant="danger"
        className="w-full"
        disabled={leaving}
        onClick={logout}
      >
        <LogOut size={16} />
        {leaving ? "Signing out…" : "Sign out"}
      </Button>
    </Modal>
  );
}
