# Lumina — Design contract

## Direction & signature move

**Cinematic dark.** The site should feel like an invitation unfolding at night: restrained, warm, and deliberately paced. The single signature move is the **celestial invitation** — a luminous rotating disc that carries the event monogram and visually anchors the whole experience.

## Tokens

```css
:root {
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 128px;

  --font-display: Georgia, "Times New Roman", serif;
  --font-body: "Helvetica Neue", Arial, sans-serif;
  --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-lg: 20px;
  --text-xl: 32px; --text-2xl: 56px; --text-3xl: 72px;

  --bg: oklch(13% 0.018 40);
  --surface: oklch(17% 0.02 40);
  --surface-raised: oklch(22% 0.025 40);
  --border: oklch(43% 0.025 55 / 0.65);
  --text: oklch(94% 0.025 86);
  --text-muted: oklch(73% 0.025 75);
  --accent: oklch(78% 0.13 78);
  --accent-hover: oklch(84% 0.12 82);
  --accent-fg: oklch(18% 0.025 55);
  --success: oklch(70% 0.14 152); --warning: oklch(80% 0.14 80); --danger: oklch(65% 0.18 25);

  --radius: 10px;
  --shadow-raised: 0 14px 36px oklch(0% 0 0 / 0.24);
  --shadow-overlay: 0 28px 90px oklch(0% 0 0 / 0.45);
  --ease: cubic-bezier(0.2, 0, 0, 1);
  --duration-fast: 150ms; --duration-base: 250ms; --duration-slow: 400ms;
}
```

## Component styling

- **Buttons:** one filled accent CTA; secondary actions use a transparent surface and border. All variants visibly respond to hover, active, focus, disabled and loading.
- **Cards:** raised surface with a hairline warm border. Keep text and visual spacing asymmetric; no generic three-column card grids.
- **Inputs and dialogs:** reserve for a future ticket flow. Labels stay persistent, focus uses the accent outline, errors have text as well as colour.

## Do / don’t

Do use large editorial type, generous negative space, warm metallic highlights, semantic landmarks, visible keyboard focus, and reduced-motion fallbacks.

Don’t use gradients in the main UI, extra accent colours, generic feature-card grids, autoplay audio, raw text over images, or motion that obscures the primary CTA.

## Responsive rules

Use a 12-column desktop grid above 960px, an 8-column tablet grid from 640px, and 4 columns below 640px. The hero visual can overlap the desktop composition, but flows beneath the copy on small screens. Tap targets remain 44px tall on touch devices.

## Agent prompt guide

Use only the roles and tokens above. Preserve a quiet cinematic hierarchy: one primary action, display serif headlines, practical sans-serif interface text, and the celestial invitation as the distinctive visual. Every new interface element must include keyboard focus and a reduced-motion-safe state.

