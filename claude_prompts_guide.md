# 🎨 Artistic Prompts for Claude Code CLI

Below are 2 detailed prompts to run in Claude Code CLI for artistic redesigns of the **Landing Page** and **Dashboard Page** with Framer Motion, 21st.dev components, and smooth multi-theme support.

---

## 🌟 Prompt 1: Artistic Landing Page Redesign (`apps/web/src/components/landing/Landing.tsx`)

```text
Enhance the landing page in apps/web/src/components/landing/Landing.tsx with Framer Motion animations and 21st.dev design patterns.

Requirements:
1. Multi-Theme Compatibility: Ensure all gradients, glass cards, and glow effects dynamically respond to all 4 theme CSS tokens (.theme-dark, .theme-cyber-violet, .theme-emerald-glow, .theme-pure-light).
2. Hero Section:
   - Floating interactive 3D resume card mockup with hover parallax spring effects.
   - Smooth animated gradient eyebrow badge ('CareerForge 2.0') with glowing border.
   - Magnetic primary CTA button ('Get Started Free ➔') with glow shadow.
3. 4-Step Interactive Feature Showcase:
   - Step 1: Master Profile Builder (Skills & Bio)
   - Step 2: Job Tracker & Application Pipeline
   - Step 3: 1-Click AI Resume & Cover Letter Tailoring
   - Step 4: Live Mock AI Interview Simulator
4. Social Proof & Performance:
   - Animated counter stats (96% Avg ATS Score, 10k+ Resumes Forged).
   - Testimonial carousel cards with Framer Motion entrance reveals.
5. FAQ Accordion & Footer:
   - Clean collapsible FAQ section with subtle glass borders.
   - Responsive sticky navbar with theme switcher compatibility.

Follow all spacing and typography guidelines defined in .claude/skills/frontend-design/SKILL.md.
```

---

## ⚡ Prompt 2: Interactive Dashboard Redesign (`apps/web/src/routes/_app.dashboard.tsx`)

```text
Redesign the user dashboard in apps/web/src/routes/_app.dashboard.tsx into an artistic AI command center.

Requirements:
1. Dynamic Stat Cards:
   - 4 glassmorphic metric cards (Resumes Created, Avg ATS Match %, Interview Sessions, Remaining AI Credits).
   - Subtle entrance animations using Framer Motion (initial={{ opacity: 0, y: 15 }}).
2. Guided 4-Step Pathway Banner:
   - Highlighting Master Profile -> Job Discovery -> Resume Tailoring -> Mock Interview.
   - Interactive hover glows and step progress badges.
3. Live Analytics & Pipeline Widgets:
   - Recharts ATS score trend area chart with glowing primary gradient fill.
   - Recharts Job Application Stage distribution bar chart.
4. Quick Action Launcher:
   - 1-Click action triggers: 'Build New Resume', 'Run ATS Scan', 'Start Mock Interview', 'Track New Job'.

Ensure smooth transitions when switching themes from the header dropdown.
```
