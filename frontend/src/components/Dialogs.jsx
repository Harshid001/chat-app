import { useEffect, useState } from "react";
import { useClerk } from "@clerk/react";
import {
  ArrowUpRight,
  Check,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { usePreferences } from "../stores/preferences";
import { Avatar, ErrorNotice, Modal, Spinner } from "./ui";
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
    <Modal title="A new conversation" onClose={onClose}>
      <p className="modal-description">Find someone. Say something.</p>
      <div className="search-field">
        <Search size={18} />
        <input
          autoFocus
          placeholder="Search people"
          aria-label="Search people"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="people-list">
        {usersError && <ErrorNotice message={usersError} onRetry={loadUsers} />}
        {usersLoading ? (
          <Spinner label="Finding people…" />
        ) : filtered.length ? (
          filtered.map((user) => (
            <button
              className="person-row"
              key={user._id}
              onClick={() => {
                selectConversation(user);
                onClose();
              }}
            >
              <Avatar user={user} online={onlineUsers.includes(user._id)} />
              <span>
                <strong>{user.fullName}</strong>
                <small>
                  {onlineUsers.includes(user._id)
                    ? "Online now"
                    : "Send a little hello"}
                </small>
              </span>
              <ArrowUpRight size={18} />
            </button>
          ))
        ) : (
          <div className="sidebar-empty">
            <UserRound size={28} />
            <h3>
              {query ? "No one by that name" : "Good company is on its way"}
            </h3>
            <p>
              {query
                ? "Try another name."
                : "Invite a friend to create an account. They’ll appear here when they join."}
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
    <Modal title="Make yourself at home" onClose={onClose}>
      <div className="profile-card">
        <Avatar user={profile} size="avatar-large" />
        <h3>{profile?.fullName}</h3>
        <p>{profile?.email}</p>
        <button
          className="text-button"
          onClick={() => {
            onClose();
            openUserProfile();
          }}
        >
          Manage your account <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="settings-section">
        <h3>Appearance</h3>
        <p>A space that feels like you.</p>
        <div className="theme-options">
          {[
            ["light", Sun, "Light"],
            ["dark", Moon, "Dark"],
            ["system", Monitor, "System"],
          ].map(([value, Icon, label]) => (
            <button
              key={value}
              className={theme === value ? "active" : ""}
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
            >
              <Icon size={20} />
              <span>{label}</span>
              {theme === value && <Check size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-section">
        <InstallButton />
        <p className="privacy-note">
          Messages stay on your server. This device caches the app shell;
          message history is kept only in memory and cleared when you sign out.
        </p>
      </div>
      {error && <ErrorNotice message={error} />}
      <button className="signout-button" disabled={leaving} onClick={logout}>
        <LogOut size={17} />
        {leaving ? "Signing out…" : "Sign out"}
      </button>
    </Modal>
  );
}
