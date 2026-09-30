export function messageDate(message) {
  if (!message) return null;
  const date =
    message.createdAt ||
    (/^[a-f\d]{24}$/i.test(message._id || "")
      ? parseInt(message._id.slice(0, 8), 16) * 1000
      : null);
  return date ? new Date(date) : null;
}
export function timeLabel(message) {
  const date = messageDate(message);
  if (!date) return "";
  const today = new Date();
  if (date.toDateString() === today.toDateString())
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
export function dayLabel(message) {
  const date = messageDate(message);
  if (!date) return "Earlier messages";
  if (date.toDateString() === new Date().toDateString()) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
export const preview = (message) =>
  message?.text ||
  (message?.image
    ? "Photo"
    : message?.video
      ? "Video"
      : "Start a conversation");
