# Product Requirements Document (PRD)
## Project: Chime — Humanized, Quiet Communication Web App
**Branch**: `harshid`  
**Status**: In Progress / Active Execution  
**Target Environment**: Production Web (Vite + React + Tailwind CSS v4 + PWA)  
**Design Ethos**: Humanized, warm, simple, quiet, non-artificial; zero "AI-slop" or synthetic neon aesthetics.

---

## 1. Executive Summary & Product Vision

### 1.1 The Problem
Modern chat applications and contemporary web redesigns have become increasingly cluttered, hyperactive, and visually aggressive. Common "AI look" tropes—overdone iridescent rainbow gradients, excessive neon glow, floating animated badges, robotic microcopy ("supercharge your workflows"), and sensory overload—detract from genuine interpersonal connection. Concurrently, technical accessibility bugs (contrast failures, broken keyboard navigation on hybrid devices, missing screen-reader announcements) create friction for everyday users.

### 1.2 The Vision
**Chime** is designed as a calm, human, tactile sanctuary for everyday conversations: *"Less noise. More connection."*
It emphasizes:
- **Humanized simplicity**: Earthy, organic tones (moss, warm linen, soft porcelain, muted sage) with natural contrast and soft shadows that feel tactile, like physical stationery.
- **Natural microcopy**: Warm, gentle, unpretentious language ("Good to see you", "Say hello", "Life, in the little messages") instead of corporate or robotic buzzwords.
- **Flawless ergonomics**: Effortless keyboard interactions (Enter to send on all hardware keyboards, Shift+Enter for new line), accessible touch targets, and full screen-reader visibility.
- **Zero AI-looking gimmicks**: No neon gradients, no synthetic sparkles on mundane actions, no forced bots, and no decorative bloat.

---

## 2. Design Philosophy: Humanized vs. "AI-Look"

| Attribute | "AI / Synthetic" Look (To Avoid) | Chime Humanized & Grounded Ethos (Enforced) |
|---|---|---|
| **Color Palette** | Neon cyan, electric purple, high-saturation magenta, rainbow mesh gradients. | Grounded sage green (`#365e49`), warm linen background (`#f5f6f3`), soft stone dark mode (`#131715`, `#1b201d`), natural forest accent. |
| **Surfaces & Borders** | Heavy glassmorphism with blinding specular highlights, iridescent borders. | Subtle, warm translucent surfaces (`bg-surface/80`), delicate borders (`#e5e9e2`), soft paper-like elevation. |
| **Typography** | Generic futuristic geometric sans with tight tracking or robotic mono headings. | Clean, highly readable Inter Variable with natural proportions, comfortable line heights (1.75 on message bubbles), and humane tracking. |
| **Motion & Physics** | Disorienting 3D tumbling cards, continuous pulsating rings, spinning gradient borders. | Purposeful, understated micro-transitions: subtle spring pills on active conversations, gentle fade/slide on message arrival, instant reduced-motion respect. |
| **Tone of Voice** | "Supercharge your chats with next-gen synergy", "Smart conversational insights". | "Good day starts with hello", "Pick a conversation, or reach out to someone new", "Slow down. Stay close." |
| **Iconography** | Complex futuristic dual-tone icons, robotic sparkles on buttons. | Simple, elegant single-stroke line icons (`lucide-react`) at consistent, balanced stroke weights. |

---

## 3. Prioritized Requirements Matrix

| ID | Priority | Category | Feature / Requirement | Impact |
|---|:---:|---|---|---|
| **PRD-CRIT-1** | **CRITICAL** | Interaction / Bug | Physical keyboard Enter-to-send support on touchscreen laptops | Fixes broken message sending for 2-in-1 / touchscreen laptop users. |
| **PRD-CRIT-2** | **CRITICAL** | Accessibility | Fix WCAG 2.1 AA text contrast failures in Light Mode | Ensures avatar initials and segmented pills pass minimum 4.5:1 contrast. |
| **PRD-CRIT-3** | **CRITICAL** | Accessibility | Add accessible roles and announcements for Online status | Screen readers can perceive when contacts are online. |
| **PRD-CRIT-4** | **CRITICAL** | Accessibility | Unified, visible `:focus-visible` rings on Input & Textarea | Keyboard navigation users have consistent focus indicators. |
| **PRD-HIGH-1** | **HIGH** | Core UX | Delightful, categorized, humanized Emoji experience | Replaces 8 static placeholder icons with a rich, curated, accessible emoji palette. |
| **PRD-HIGH-2** | **HIGH** | UX / Architecture | Component normalization & tactile feedback | Replaces raw `<button>` elements with unified, tactile `Button` / `IconButton` variants. |
| **PRD-HIGH-3** | **HIGH** | Mobile UX | Minimum 44px tap target envelope on mobile | Prevents mis-taps on phones and tablets. |
| **PRD-HIGH-4** | **HIGH** | Performance | Code-splitting & Lazy loading for modals | Optimizes initial bundle by deferring `Settings`, `NewConversation`, and `AttachmentUpload`. |
| **PRD-MED-1** | **MEDIUM** | Design Tokens | Token scale formalization & magic number elimination | Replaces arbitrary pixel sizing with standardized typographic, radius, and elevation tokens. |
| **PRD-MED-2** | **MEDIUM** | Code Quality | JS / CSS color token de-duplication | Eliminates hardcoded hex drift between `Chime.jsx`, `App.jsx`, and `index.css`. |
| **PRD-MED-3** | **MEDIUM** | Polish | Humanized micro-interactions & subtle states | Adds soft press physics, gentle unread indicators, and soothing empty state illustrations. |
| **PRD-MED-4** | **MEDIUM** | Code Cleanliness | Elimination of dead template files & assets | Removes unreferenced `App.css` and leftover Vite template files. |
| **PRD-LOW-1** | **LOW** | Resilience | Graceful media fallback cards | Displays human-friendly fallback cards if images or videos fail to load. |
| **PRD-LOW-2** | **LOW** | Accessibility | Chat header compound button accessibility | Adds `aria-haspopup="dialog"` to the conversation details header button. |
| **PRD-LOW-3** | **LOW** | Forms / Resilience | Multi-platform file type extension fallback | Ensures file upload works reliably across Windows, iOS, and Android. |

---

## 4. Detailed Technical Specifications

### 4.1 Critical Priority Specifications

#### PRD-CRIT-1: Physical Keyboard Enter-to-Send on Touchscreen Laptops
- **File**: `frontend/src/components/ChatPanel.jsx`
- **Root Cause**: `window.matchMedia("(pointer: coarse)").matches` evaluates to `true` on any touch-enabled laptop (e.g. Surface, Lenovo Yoga, Dell XPS 2-in-1), disabling Enter-to-send on physical keyboards.
- **Specification**: Remove `(pointer: coarse)` check on physical `keydown` events. Mobile virtual keyboards submit via the explicit tap button or virtual return key.
```javascript
// Clean specification:
onKeyDown={(event) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.nativeEvent.isComposing
  ) {
    send(event);
  }
}}
```

#### PRD-CRIT-2: WCAG 2.1 AA Contrast Repairs in Light Mode
- **Files**: `frontend/src/components/ui.jsx`, `frontend/src/index.css`
- **Specification**:
  - Avatar Fallback Tone 2: Update text color from `#866450` (4.08:1) to `#634735` (5.80:1 against `#eddfd5`).
  - Avatar Fallback Tone 3: Update text color from `#7c704b` (3.80:1) to `#5a502f` (5.55:1 against `#e9e2d0`).
  - Segmented Control unselected text: Update from `text-muted-foreground` (4.40:1 on `bg-muted/60`) to `text-foreground/70` (6.80:1), maintaining visual hierarchy while surpassing the 4.5:1 threshold.

#### PRD-CRIT-3: Screen Reader Online Status Announcement
- **File**: `frontend/src/components/ui.jsx`
- **Specification**:
  - Update Avatar online indicator:
    ```jsx
    {online && (
      <span
        role="status"
        aria-label="Online"
        className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface bg-status"
      />
    )}
    ```

#### PRD-CRIT-4: Standardized Focus Indicators
- **Files**: `frontend/src/components/ui.jsx`, `frontend/src/index.css`
- **Specification**:
  - Ensure `Textarea` has a visible, high-contrast focus indicator (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`) both when inside composer and when used independently in modals.

---

### 4.2 High Priority Specifications

#### PRD-HIGH-1: Delightful, Categorized, Humanized Emoji Picker
- **File**: `frontend/src/components/ChatPanel.jsx`
- **Specification**:
  - Replace the 8-emoji static grid with an intuitive popover organized into natural categories:
    1. *Warmth & Expressions* (😊, 🥰, 😌, ✨, 💛, ☕, 🌿, 🌸)
    2. *Reactions & Gestures* (👍, 🙌, 🤝, 🙏, 👋, ✌️, ❤️, 🫂)
    3. *Joy & Laughter* (😂, 🥳, 🎉, 🎈, 🥂, 🎶, ☀️, 🌈)
    4. *Thoughts & Everyday* (💭, 💡, 📖, ✍️, 🏡, 🌙, ⭐, 🕊️)
  - Include quick category pills, search/filter capability, tactile button states, and screen-reader accessible labels for every emoji.

#### PRD-HIGH-2: Component Architecture Normalization & Tactile Feedback
- **Files**: `frontend/src/components/ui.jsx`, `frontend/src/components/Sidebar.jsx`, `frontend/src/components/ChatPanel.jsx`
- **Specification**:
  - Add gentle physical active states to `Button`: `active:scale-[0.98] transition-transform`.
  - Replace raw `<button>` elements in `Sidebar` and `ChatPanel` with unified button primitives that adhere to focus, hover, and disabled standards.

#### PRD-HIGH-3: Enhanced Mobile & Touch Target Compliance
- **Files**: `frontend/src/components/ui.jsx`, `frontend/src/components/Sidebar.jsx`
- **Specification**:
  - Ensure all clickable icon buttons and segmented control items have at least 44x44px touch envelopes on touch viewports (`min-h-11 sm:min-h-9` or invisible touch-padding extensions).

#### PRD-HIGH-4: Code-Splitting & Lazy Loading for Modals
- **Files**: `frontend/src/App.jsx`, `frontend/src/components/ChatPanel.jsx`, `frontend/vite.config.js`
- **Specification**:
  - Dynamically import `NewConversation`, `Settings`, and `AttachmentUpload` with `React.lazy()` and `Suspense`.
  - Update `vite.config.js` to ensure production bundle splitting is standard and compatible across all Vite environments.

---

### 4.3 Medium Priority Specifications

#### PRD-MED-1: Token Scale Consolidation
- **File**: `frontend/src/index.css`
- **Specification**:
  - Define formal semantic radius tokens in `@theme inline`:
    `--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; --radius-2xl: 24px; --radius-full: 9999px;`
  - Define typographic scale tokens so arbitrary magic pixel fonts (`text-[10px]`, `text-[13px]`, `text-[25px]`) map to clean semantic scale utilities (`text-2xs`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`).

#### PRD-MED-2: JS / CSS Color Token De-duplication
- **Files**: `frontend/src/Chime.jsx`, `frontend/src/App.jsx`
- **Specification**:
  - Dynamically read CSS variable values or centralize color definitions in a single token constant file, eliminating hardcoded hex codes across multiple files.

#### PRD-MED-3: Humanized Micro-Interactions
- **Files**: `frontend/src/components/ChatPanel.jsx`, `frontend/src/components/Sidebar.jsx`
- **Specification**:
  - Smooth unread badge counter transitions.
  - Soothing empty conversation card with gentle typography and tactile buttons.
  - Gentle scroll-to-bottom floating pill with arrow indicator.

#### PRD-MED-4: Elimination of Dead Template Artifacts
- **Files**: Remove `frontend/src/App.css`, remove `frontend/src/assets/hero.png`, `react.svg`, `vite.svg`.
- **Specification**:
  - Clean up filesystem to ensure zero dead code or misleading starter template files.

---

### 4.4 Low Priority Specifications

#### PRD-LOW-1: Graceful Media Fallback Cards
- **File**: `frontend/src/components/ChatPanel.jsx`
- **Specification**:
  - If a shared photo or video fails to load, render an elegant, soothing placeholder card with an image icon, filename/dimensions if available, and a friendly "Photo unavailable · Open to retry" link.

#### PRD-LOW-2: Conversation Header Compound Button Accessibility
- **File**: `frontend/src/components/ChatPanel.jsx`
- **Specification**:
  - Add `aria-haspopup="dialog"` and `aria-label="View conversation details"` to the header title trigger.

#### PRD-LOW-3: File Format Validation Fallback
- **File**: `frontend/src/components/AttachmentUpload.jsx`
- **Specification**:
  - Fall back to file extension matching (`.jpg`, `.png`, `.webp`, `.mp4`, `.mov`) when browser MIME type is empty or generic.

---

## 5. Verification & Acceptance Criteria

1. **Accessibility**:
   - All text contrast ratios in Light Mode and Dark Mode exceed WCAG 2.1 AA (4.5:1 for normal text, 3.0:1 for large text/icons).
   - Screen reader users receive audible announcements when contacts are online.
   - Visible keyboard focus rings appear on all interactive controls without invisible focus traps.
2. **Keyboard Ergonomics**:
   - `Enter` sends message on physical keyboards across macOS, Windows, Linux, and touchscreen laptops.
   - `Shift + Enter` reliably creates new lines.
   - `Escape` closes all modals and dialogs without losing staged draft text.
3. **Aesthetics & Tone**:
   - Visual design looks natural, calm, grounded, and human—zero artificial glow, cyber aesthetics, or robotic copy.
   - Curated emoji picker offers quick, human expressions organized intuitively.
4. **Performance & Cleanliness**:
   - Zero dead template files (`App.css`, unreferenced SVGs/PNGs).
   - Modals lazy-load smoothly without blocking initial page render.
   - Build completes with zero lint errors or missing imports.
