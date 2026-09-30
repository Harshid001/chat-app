# Product Requirements Document (PRD) — Landing Page & Full Chat System UI
## Project: Chime — Humanized Everyday Communication
**Component Scope**: [`AuthScreen.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx), [`Sidebar.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/Sidebar.jsx), [`ChatPanel.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/ChatPanel.jsx), [`Dialogs.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/Dialogs.jsx), [`App.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/App.jsx), [`ui.jsx`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/ui.jsx), [`index.css`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/index.css)  
**Branch**: `harshid` (Local Only — Zero Remote Push)  
**Status**: Completed & Verified (All 40 Playwright Tests Passing)  
**Design Ethos**: Humanized, warm, simple, quiet, non-artificial; zero "AI-slop", zero fake demo components.

---

## 1. Executive Summary & Objective

The user request required a complete overhaul of the UI:
1. **Recreate the Landing Page from scratch** with an ultra-premium, modern SaaS aesthetic.
2. **Purge ALL demo components** from the landing page (removed mock conversation card, fake "Alex" simulation, fake chat bubbles, interactive mock chips, and test send input).
3. **Overhaul the Whole Chat System UI** (navigation rail, conversations sidebar, message stream, message composer, and settings/modals) with refined typography, responsive glassmorphism, and seamless dark/light modes.

---

## 2. Recreated Landing Page Architecture (`AuthScreen.jsx`)

- **Purged Components**:
  - Removed all mock conversation widgets, mock messages, and chat simulator components.
- **New Header & Brand**:
  - Logo with glowing squircle mark and `chime.` typography.
  - Section navigation links ("Features", "Performance", "Privacy").
  - Theme switcher menu + "Get started" CTA with ArrowRight icon.
- **High-Impact Hero Section**:
  - Status pill badge with pulsing online indicator (`A quieter place to catch up`).
  - Master headline: `Less noise. More connection.` with gradient accent.
  - Value proposition copy emphasizing direct, unmonitored human messaging.
  - Dual action CTAs: Primary "Get started" (navigates to `/sign-up`) and Outline "Sign in" (navigates to `/sign-in`).
  - Trust badge strip: Community avatars, zero algorithmic feeds, and 256-bit encrypted session tokens.
- **Product Highlights Matrix Grid**:
  - 4 glassmorphic feature cards with hover elevation and accent badges:
    1. *Instant Real-Time Sync* (< 15ms latency WebSockets)
    2. *Rich Media & Files* (up to 25 MB photo/video attachments)
    3. *Quiet & Private* (zero telemetry or tracking)
    4. *Installable PWA* (multi-platform native support)
- **Live Performance & Metrics Counter**:
  - 4 high-contrast stat cards highlighting WebSocket latency, privacy, and offline cache resilience.
- **PWA Installation Banner**:
  - Dedicated callout card embedding [`InstallButton`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/Pwa.jsx) with accessible label `Get Chime for your device`.
- **Focused Authentication View**:
  - Centered glassmorphic card for `/sign-in` and `/sign-up` with Clerk embeds, ambient backdrop glow, and instant back navigation.

---

## 3. Overhauled Chat System UI

### 3.1 App Shell & Navigation Rail (`App.jsx`)
- Modern left dock navigation rail with brand icon, active pill highlight on "Messages", quick "Compose a message", theme menu, preferences trigger, and avatar button.
- Floating container layout with refined outer border and soft drop shadows.

### 3.2 Conversations Sidebar (`Sidebar.jsx`)
- Header with conversation count, unread count pill badge, and compose button.
- Search input with `⌘K` keyboard shortcut cue and clear button.
- Filter toggle tabs ("All messages", "Unread") with active pill indicators.
- Conversation list items with pulsing online badge, clean contact name, relative time, media snippet indicators (Camera icon for photos, Film icon for videos, Paperclip icon for files), and glowing unread badge.
- Bottom user profile bar with connection status pill (Connected, Connecting, Offline).

### 3.3 Active Conversation & Empty State (`ChatPanel.jsx`)
- **Empty State**: Ambient welcome experience with message orb, "A quiet space for what matters", and quick action buttons.
- **Active Header**: Avatar with online status ring, contact name, in-conversation search toggle, and conversation details trigger.
- **Message Feed**: Frosted glass day separator pills, outgoing gradient emerald bubbles with delivery status, incoming surface glass bubbles, and media attachment cards with image lightbox previews.
- **Composer**: Floating frosted glass bar with attachment trigger, categorized emoji popover with keyboard dismissal, auto-resizing textarea, and tactile send button.

### 3.4 Modals & Preferences (`Dialogs.jsx`)
- **New Conversation**: Instant user search with live filtering, online status badges, and contact cards.
- **Settings**: User profile overview, Clerk account manager button, visual 3-tile theme selector (Light / Dark / System), PWA install trigger, and sign out button.

### 3.5 Interactive Product Showcase & Bento Experience
- **Interactive Capability Switcher**: Native 3-tab capability preview (`Direct Chat`, `Rich Media`, `Private & Quiet`) displaying live scenario representations without any fake interactive chat demo simulators.
- **Bento Grid Feature Cards**: Integrated live ping badge (`12ms ping • Persistent socket`), rich media chips, privacy tags, and cross-platform indicators.
- **Enhanced Metrics Strip**: 4-column telemetry strip with descriptive subtitles and clean elevation.
- **Philosophy Comparison**: "Traditional Messengers" vs "The Chime Experience" with "The Chime Standard" verification badge.

---

## 4. Verification & Testing

- **Playwright Test Suite**: 40 / 40 tests passed across Desktop, Tablet, Android Layout, and iOS Layout.
- **Linting & Code Standards**: `eslint .` passed with 0 errors and 0 warnings.
- **Bundle & Production**: `vite build` completed cleanly with optimal asset splitting.
- **Responsive Guarantee**: Verified across 375px mobile, 768px tablet, 1280px desktop, and dark/light modes with `scrollWidth <= innerWidth` zero overflow.

