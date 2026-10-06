# PhisCatcher — UI Rules (Minimal Monochrome Theme)

## Purpose

The interface should feel modern, premium, and focused on security while using a **minimal black‑white palette**. Colors must come from semantic design tokens defined in `globals.css`; raw hex values or literal Tailwind color classes are prohibited.

## Design Direction

- **Monochrome palette** – primarily background, card, muted, and accent tokens (`bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `text-foreground`, `text-muted-foreground`, etc.).
- Subtle gradients are allowed **only** when they use these tokens (e.g., `bg-gradient-to-b from-background to-muted`).
- No Holi colors or other bright palettes.
- Dark mode must use deep charcoal backgrounds with cool blue‑gray accents, defined via the same tokens.

## Token System

All colors are defined centrally in `app/globals.css`. Components must reference only these semantic tokens:
```
bg-background
bg-card
bg-muted
bg-accent
text-foreground
text-muted-foreground
border-border
ring-ring
```
Any new visual role should add a token here, never inline a hex.

## Component Guidelines

- Use **shadcn/ui** primitives and extend them with variants that reference the tokens.
- Buttons must support the new `dark` and `light` variants (see `components/ui/button.tsx`).
- Avoid copying styles; share via design‑system utilities.

## Gradients

Gradients must be expressed with token classes, e.g.:
```
bg-gradient-to-b from-background to-muted
```
Do not use raw `bg-[radial-gradient(...)]` with hexes.

## Accessibility

- Maintain keyboard operability, visible focus rings, and sufficient contrast for black‑white surfaces.
- Pair any status color with text/icon and explicit labels.

## Animation

Use subtle motion to convey pipeline activity (e.g., stream activation, QR detection) while respecting `prefers-reduced-motion`.

## Responsive Layout

Support desktop, tablet, and mobile with the existing grid system; no horizontal scrolling.

## Verification Checklist

- No raw hex values in JSX/TSX.
- All colors derived from semantic tokens.
- Dark mode remains readable and “very cool”.
- UI adheres to the minimal monochrome aesthetic.
