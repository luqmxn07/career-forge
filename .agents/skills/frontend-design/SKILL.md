---
name: frontend-design
description: Design-focused rules and guidelines for building high-end, premium web applications with Framer Motion and modern design tokens.
---

# Premium Frontend Design System & Taste Guidelines

## Core Principles
1. **Never look generic or static**: Avoid default white/gray layouts. Use curated dark mode, glassmorphism, dynamic gradients, and smooth micro-animations.
2. **Typography Scale**: Use modern fonts like `Space Grotesk` or `Inter` with structured scale (`text-[10px]`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`, `text-4xl`, `text-6xl`).
3. **8px Grid Spacing**: All margins, paddings, and gaps must strictly follow 4px/8px multiples (`p-2`, `p-4`, `p-6`, `p-8`, `gap-3`, `gap-4`, `gap-6`).
4. **Color Tokens**:
   - **Background**: Dark slate / glass surfaces (`bg-white/[0.02]`, `bg-black/40`, `glass-panel`).
   - **Primary Glow**: Vibrant electric blue / cyan (`hsl(212 100% 60%)`).
   - **Accents**: Emerald green (`#10b981`), Amber gold (`#f59e0b`), Purple glow (`#8b5cf6`).
   - **Borders**: Thin glass borders (`border-glass-border`, `border-white/10`).

## Animation Rules (Framer Motion)
- **Scroll Reveals**: Wrap hero and feature cards in `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`.
- **Staggered Children**: Use staggered delays (`delay: index * 0.05`) for lists, cards, and grid items.
- **Button Interactions**: Apply hover glow and active scaling (`whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.98 }}`).

## Component Patterns
- **Cards**: `GlassCard` with subtle borders, backdrop blur, hover elevation, and glowing accent indicators.
- **Buttons**: `btn-glow`, `btn-glow-hover` with gradient background, crisp typography, and icon indicators.
- **Badges**: Rounded-full pill tags with semi-transparent tinted background and high-contrast text.
