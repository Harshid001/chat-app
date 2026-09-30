import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  Check,
  FileImage,
  Film,
  ImagePlus,
  RefreshCw,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import { Button, IconButton, Modal, Textarea } from "./ui";
import { cn } from "../lib/utils";

const ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime";
const TYPES = new Set(ACCEPT.split(","));
const EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "mp4",
  "webm",
  "mov",
]);
function validate(file) {
  const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
  const typeValid = TYPES.has(file.type);
  const extValid = EXTENSIONS.has(ext);
  if (!typeValid && !extValid)
    return "This format isn’t supported. Choose JPG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV. Export HEIC photos as JPG first.";
  if (!file.size)
    return "This file is empty. Choose a photo or video with content.";
  if (file.size > 25 * 1024 * 1024)
    return "This file exceeds 25 MB. Compress it or choose a smaller file.";
  return "";
}
function sizeLabel(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function AttachmentPreview({ file, compact = false }) {
  const [preview, setPreview] = useState(null);
  const [failedFile, setFailedFile] = useState(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const timer = setTimeout(() => setPreview({ file, url }), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [file]);
  const video = file.type.startsWith("video/");
  const Icon = video ? Film : FileImage;
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-2xl border bg-muted/50",
        compact ? "h-32" : "h-44 sm:h-52",
      )}
    >
      {failedFile === file ? (
        <p className="px-5 text-center text-xs leading-5 text-muted-foreground">
          Preview unavailable in this browser. You can still send this file.
        </p>
      ) : preview?.file === file ? (
        video ? (
          <video
            src={preview.url}
            controls
            preload="metadata"
            aria-label="Video attachment preview"
            className="h-full w-full object-contain"
            onError={() => setFailedFile(file)}
          />
        ) : (
          <img
            src={preview.url}
            alt={`Preview of ${file.name}`}
            className="h-full w-full object-contain"
            onError={() => setFailedFile(file)}
          />
        )
      ) : (
        <Icon size={30} className="text-muted-foreground" />
      )}
    </div>
  );
}

export default function AttachmentUpload({
  initialFile,
  initialCaption = "",
  recipient,
  online,
  onClose,
  onSend,
}) {
  const [file, setFile] = useState(() =>
    initialFile && !validate(initialFile) ? initialFile : null,
  );
  const [error, setError] = useState(() =>
    initialFile ? validate(initialFile) : "",
  );
  const [caption, setCaption] = useState(initialCaption);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);
  const browseButton = useRef(null);
  const submitLock = useRef(false);
  const id = useId();
  function choose(files) {
    setDragging(false);
    if (!files.length) return;
    if (files.length > 1) {
      setError(
        "Choose one attachment at a time. Send this file before adding another.",
      );
      return;
    }
    const selected = files[0];
    const issue = validate(selected);
    if (issue) {
      setError(issue);
      return;
    }
    setFile(selected);
    setError("");
  }
  return (
    <Modal
      title="Send an attachment"
      description={`Share a photo or video${recipient ? ` with ${recipient}` : ""}. Preview it before sending.`}
      onClose={onClose}
      className="max-w-lg"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!file || !online || error || submitLock.current) return;
          submitLock.current = true;
          onSend(file, caption.trim());
        }}
        className="space-y-5"
      >
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            choose(event.dataTransfer.files);
          }}
          className={cn(
            "rounded-3xl transition-shadow",
            dragging && "ring-2 ring-primary ring-offset-4 ring-offset-surface",
          )}
        >
          <input
            id={`${id}-file`}
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose attachment file"
            aria-describedby={`${id}-formats ${id}-error`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              choose(event.target.files);
              event.target.value = "";
            }}
          />
          {file ? (
            <div className="space-y-3 rounded-3xl border bg-background/40 p-3">
              <AttachmentPreview file={file} />
              <div className="flex items-center gap-3 px-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-surface/70 text-primary">
                  <FileImage size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sizeLabel(file.size)} ·{" "}
                    {file.type.startsWith("video/") ? "Video" : "Image"}
                  </p>
                </div>
                <IconButton
                  label="Remove attachment"
                  onClick={() => {
                    setFile(null);
                    setError("");
                    requestAnimationFrame(() => browseButton.current?.focus());
                  }}
                >
                  <X size={17} />
                </IconButton>
              </div>
              <Button
                variant="outline"
                size="small"
                className="w-full"
                onClick={() => fileInput.current.click()}
              >
                <RefreshCw size={14} />
                Change file
              </Button>
            </div>
          ) : (
            <button
              ref={browseButton}
              type="button"
              aria-describedby={`${id}-formats`}
              onClick={() => fileInput.current.click()}
              className="flex w-full flex-col items-center rounded-3xl border border-dashed border-primary/35 bg-accent/20 px-5 py-8 text-center transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-surface/75 text-primary shadow-xs backdrop-blur-xl">
                <ImagePlus size={26} strokeWidth={1.5} />
              </span>
              <span className="text-sm font-semibold">
                Choose a photo or video
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">
                Or drop a file here
              </span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                <Upload size={14} />
                Browse files
              </span>
            </button>
          )}
        </div>
        <p
          id={`${id}-formats`}
          className="text-xs leading-5 text-muted-foreground"
        >
          JPG, PNG, GIF, WebP, AVIF · MP4, WebM, MOV
          <br />
          One file at a time · Up to 25 MB
        </p>
        {error && (
          <div
            id={`${id}-error`}
            role="alert"
            className="flex gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Check your attachment</p>
              <p className="mt-1 text-xs leading-5">{error}</p>
              {file && (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold underline underline-offset-4"
                  onClick={() => setError("")}
                >
                  Keep the selected file
                </button>
              )}
            </div>
          </div>
        )}
        <div>
          <label htmlFor={`${id}-caption`} className="text-xs font-medium">
            Caption{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Textarea
            id={`${id}-caption`}
            rows={2}
            maxLength={5000}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Add a little context…"
            className="mt-2 rounded-2xl border bg-surface/60 p-3 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {!online && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-2xl bg-accent/50 p-3 text-xs leading-5 text-accent-foreground"
          >
            <WifiOff size={16} className="mt-0.5 shrink-0" />
            You’re offline. Reconnect to send; your selection will stay here
            while this window is open.
          </p>
        )}
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!file || !online || Boolean(error)}>
            <ArrowUp size={17} />
            Send attachment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function PendingAttachment({ message, online, onRetry }) {
  const failed = message.status === "failed";
  const transferred = message.uploadProgress === 100;
  return (
    <div
      className="w-60 max-w-full space-y-3 rounded-2xl p-2 text-left text-foreground sm:w-72"
      aria-label={`Attachment: ${message.file.name}`}
    >
      <AttachmentPreview file={message.file} compact />
      <div>
        <p className="truncate text-xs font-medium" title={message.file.name}>
          {message.file.name}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {sizeLabel(message.file.size)}
        </p>
      </div>
      {failed ? (
        <div role="alert" className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertCircle size={14} />
            Attachment not sent
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {message.error}
          </p>
          <Button
            variant="outline"
            size="small"
            disabled={!online}
            onClick={onRetry}
            className="w-full"
          >
            <RefreshCw size={13} />
            Retry upload
          </Button>
          {!online && (
            <p className="text-xs text-muted-foreground">Reconnect to retry.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            role="status"
            className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
          >
            <span>
              {transferred ? "Processing attachment…" : "Uploading attachment…"}
            </span>
            {transferred ? (
              <Check size={13} />
            ) : (
              <span>{message.uploadProgress ?? 0}%</span>
            )}
          </div>
          <div
            role="progressbar"
            aria-label={
              transferred ? "Processing attachment" : "Upload progress"
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              transferred ? undefined : (message.uploadProgress ?? 0)
            }
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none",
                transferred && "animate-pulse motion-reduce:animate-none",
              )}
              style={{ width: `${message.uploadProgress ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">
            {transferred
              ? "Waiting for the server to save your message."
              : "Keep Chime open until your message is sent."}
          </p>
        </div>
      )}
    </div>
  );
}
