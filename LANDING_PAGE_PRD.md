# Product Requirements Document (PRD) — Landing Page & Onboarding
## Project: Chime — Humanized Everyday Communication
**Component Scope**: `AuthScreen.jsx`, `Brand`, `ThemeMenu`, `InstallButton`, `PreviewCard`, Clerk Auth Embeds  
**Branch**: `harshid` (Local Only — Zero Remote Push)  
**Status**: In Progress / Active Execution  
**Design Ethos**: Humanized, warm, simple, quiet, non-artificial; zero "AI-slop" or synthetic neon aesthetics.

---

## 1. Executive Summary & Objective

The landing page is the first touchpoint where visitors encounter **Chime**. In an era dominated by hyperactive, neon-soaked, AI-heavy interfaces with generic floating cards and synthetic copy, Chime’s landing page must embody its core promise: **"Less noise. More connection."**

This PRD establishes the complete component audit, UX guidelines, accessibility standards, and prioritized implementation plan for the landing page and all its subcomponents.

---

## 2. Component Inventory & Audit of the Landing Page

### 2.1 Component Breakdown

| Component / Section | File & Line | Current Behavior | Humanized UX Opportunity |
|---|---|---|---|
| **Header & Brand** | [`AuthScreen.jsx:45-53`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L45-L53) | Renders `Brand` logo with `chime.` wordmark, tagline, and `ThemeMenu`. | Clean and simple. Ensure consistent 44px tap targets for mobile theme toggle. |
| **Status Pill** | [`AuthScreen.jsx:62-65`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L62-L65) | `<span ...>A quieter place to catch up</span>` with status dot. | Add accessible `role="status"` to dot so screen readers announce calm availability. |
| **Headline & Copy** | [`AuthScreen.jsx:66-76`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L66-L76) | Clamped text with `tracking-[-1.7px]` and primary colored accent. | Soften tracking from harsh `-1.7px` to organic `-0.03em`. Warm, honest copy. |
| **Hero Action CTAs** | [`AuthScreen.jsx:110-125`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L110-L125) | "Get started" primary button with arrow and "Sign in" outline button. | Add tactile physics (`active:scale-[0.98]`) and visible focus states. |
| **Social Proof Avatars** | [`AuthScreen.jsx:126-137`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L126-L137) | Overlapping initials for "Ari", "Sam", "Jo" + "Your people. Your pace." | Ensure WCAG AA contrast on avatar fallback text and accessible labels. |
| **Conversation Preview Card** | [`AuthScreen.jsx:191-253`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L191-L253) | Static mock conversation between user and "Alex". | **Key Opportunity**: Make the preview card delightfully interactive so visitors can try typing or tapping a friendly icebreaker before creating an account! |
| **Floating Feature Pill** | [`AuthScreen.jsx:249-252`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L249-L252) | Uses `<Sparkles size={13} className="text-primary" />` icon. | **AI-Look Bug**: Replace synthetic `Sparkles` icon with a warm human icon (`Heart` / `Coffee` / `Smile`). |
| **Embedded Auth Forms** | [`AuthScreen.jsx:162-176`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L162-L176) | Renders Clerk `<SignIn />` and `<SignUp />` with back button. | Harmonize radius (16px), shadow, and button styling with native design tokens. |
| **Landing Footer** | [`AuthScreen.jsx:255-260`](file:///d:/NewVolumeE/Vineet%20project/chat-app/frontend/src/components/AuthScreen.jsx#L255-L260) | "Made for real conversations" + PWA install button + "Slow down. Stay close." | Improve mobile responsive wrapping and tactile feel on install button. |

---

## 3. Prioritized Requirements Matrix

| ID | Priority | Category | Requirement / Improvement | Impact |
|---|:---:|---|---|---|
| **LANDING-CRIT-1** | **CRITICAL** | Accessibility | Fix sub-10px illegible text in preview card | Replaces `text-[9px]` with legible `text-[11px]` (≥ 4.5:1 contrast). |
| **LANDING-CRIT-2** | **CRITICAL** | Accessibility | Accessible status indicator on landing header & hero | Adds `role="status"` to status dots so assistive tech announces state. |
| **LANDING-CRIT-3** | **CRITICAL** | Ergonomics | Full keyboard navigation & focus rings across landing elements | All interactive links/buttons have high-contrast `:focus-visible` rings. |
| **LANDING-HIGH-1** | **HIGH** | Humanized UI | Purge AI-look artifacts (remove `Sparkles` icon) | Replaces synthetic AI sparkle icon with warm, human `Heart` / `Coffee` icon. |
| **LANDING-HIGH-2** | **HIGH** | Delightful UX | Interactive "Try Before You Join" preview card | Visitors can type in the preview input or tap sample chips to see how calm messaging feels. |
| **LANDING-HIGH-3** | **HIGH** | Mobile UX | Mobile viewport layout optimization (375px/390px) | Reduces excessive card height on mobile; ensures comfortable spacing. |
| **LANDING-HIGH-4** | **HIGH** | Interaction | Tactile physical feedback on all buttons | Subtle `active:scale-[0.98]` physical press physics on buttons. |
| **LANDING-MED-1** | **MEDIUM** | Typography | Soften aggressive negative letter-spacing | Replaces severe `-1.7px` tracking with natural organic letter-spacing. |
| **LANDING-MED-2** | **MEDIUM** | Visual Polish | Clerk embedded card styling refinement | Eliminates redundant outer borders or harsh contrast shifts in auth mode. |
| **LANDING-MED-3** | **MEDIUM** | SEO / Routing | Dynamic document title update per auth route | Sets title to "Sign In" or "Create Account" when navigating via popstate. |
| **LANDING-LOW-1** | **LOW** | Polish | PWA install trigger tactile feedback in footer | Adds hover/active tactile styling to the footer install action. |
| **LANDING-LOW-2** | **LOW** | Visual | Ambient radial background dot pattern optimization | Subtle pattern opacity adjustment for seamless dark/light adaptation. |

---

## 4. Technical Specifications & Implementation Details

### 4.1 Critical Requirements

#### LANDING-CRIT-1: Elimination of Sub-10px Text & Contrast Fix
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Current**: Line 235 uses `text-[9px] text-muted-foreground` for the message read receipt.
- **Specification**: Update to `text-[11px] text-muted-foreground font-medium`, ensuring readability on retina and non-retina displays alike.

#### LANDING-CRIT-2: Accessible Status Indicators
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**: Update status dot in line 63 with `role="status"` and `<span className="sr-only"> (Available)</span>`.

#### LANDING-CRIT-3: Keyboard & Focus Visibility
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**: Ensure all buttons (`Get started`, `Sign in`, `Back to Chime`, `Try again`) use standardized `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

---

### 4.2 High Priority Requirements

#### LANDING-HIGH-1: Purge AI-Look Artifacts
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Current**: Line 250 renders `<Sparkles size={13} className="text-primary" />`.
- **Specification**: Replace with a warm, grounded icon (`Heart` or `Coffee`) and human copy:
  ```jsx
  <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/75 px-4 py-2.5 text-xs text-muted-foreground shadow-xs backdrop-blur-xl">
    <Heart size={13} className="text-primary fill-primary/20" />
    A little hello goes a long way.
  </span>
  ```

#### LANDING-HIGH-2: Interactive Live Preview Card
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**:
  - Transform the static mockup into an interactive, delightful live preview!
  - Visitors can type into the preview's "Write a message…" input and press send, or click warm icebreaker chips ("Coffee later?", "How are you?").
  - The preview conversation appends their message immediately and responds after a gentle 800ms delay with a warm message ("Can't wait! See you then 😊").
  - This demonstrates Chime’s quiet, human messaging rhythm directly to prospective users without requiring an account first!

#### LANDING-HIGH-3: Responsive Mobile Viewport Refinement
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**:
  - On mobile viewports (`< 768px`), reduce preview card minimum height from `min-h-[460px]` to `min-h-[380px]` with streamlined message bubble spacing.
  - Maintain ample touch targets (≥ 44px) for all buttons.

#### LANDING-HIGH-4: Tactile Physical Feedback
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**:
  - Primary CTA buttons have `active:scale-[0.98] transition-transform duration-100`.
  - Secondary buttons have subtle hover highlights.

---

### 4.3 Medium Priority Requirements

#### LANDING-MED-1: Typography & Letter-Spacing Softening
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**:
  - Update `h1` in line 66:
    From: `tracking-[-1.7px]`
    To: `tracking-tight sm:tracking-[-0.03em]`
  - Ensures headline looks elegant, warm, and natural on both small and large screens.

#### LANDING-MED-2: Embedded Auth Card Refinements
- **File**: `frontend/src/index.css` & `frontend/src/Chime.jsx`
- **Specification**:
  - Ensure Clerk card smoothly inherits CSS variable tokens without harsh box-shadows or jarring outer frames.

#### LANDING-MED-3: Dynamic Document Title Updates
- **File**: `frontend/src/components/AuthScreen.jsx`
- **Specification**:
  - Update `document.title` on mode change:
    - `"welcome"`: `"Chime — A little more connected"`
    - `"signin"`: `"Sign in — Chime"`
    - `"signup"`: `"Create your account — Chime"`

---

## 5. Verification & Acceptance Criteria

1. **Humanized Quality**:
   - Zero AI-look tropes (no generic sparkles, no cyber neon, no robotic copy).
   - Warm, grounding aesthetic with organic moss green and linen surfaces.
2. **Interactive Preview**:
   - Visitors can type and send a test message in the preview card, receiving an instant, gentle response.
3. **Accessibility**:
   - All text contrast ratios exceed WCAG 2.1 AA (4.5:1).
   - Full keyboard accessibility with clear focus rings.
   - All status indicators announced by screen readers.
4. **Build & Performance**:
   - Zero console errors or warnings.
   - Clean production build with Vite in < 1 second.
