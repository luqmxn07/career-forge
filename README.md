# 🚀 CareerForge — AI Career Platform & Development Stack

Welcome to **CareerForge**, an end-to-end AI-powered career platform providing resume building, ATS match scanning, interactive AI interview practice, cover letter generation, and job tracking.

---

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, TanStack Router, TanStack Query, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js / Express, Prisma ORM, PostgreSQL (Neon DB), Redis |
| **AI Gateway** | OmniRoute (Routing 90+ free AI models), Gemini, DeepSeek, Llama 3 |
| **CLI & Automation** | Claude Code v2.1.92, Antigravity Agent |

---

## 🤖 Next Steps: Building & Editing with Claude Code CLI + OmniRoute

Follow this step-by-step workflow to build, edit, and enhance CareerForge using Claude Code CLI with zero API costs:

### Step 1: Open Terminal in Project Directory
Navigate directly into your CareerForge project directory:
```powershell
cd "C:\Users\wwwar\Documents\career forge"
```

### Step 2: Route Claude Code Through Free OmniRoute AI Gateway
Run these 3 lines in PowerShell to route Claude Code through OmniRoute for free API access:

```powershell
$env:ANTHROPIC_API_KEY="sk-ant-api03-omniroute-free"
$env:ANTHROPIC_BASE_URL="http://localhost:3000/v1"
claude --permission-mode auto
```

*(Select Option `1. Yes` when prompted to use the custom environment API key)*

---

## 🎨 Step 3: Frontend Design Skill & Framer Motion Setup

The project includes an automatic design-taste skill pre-configured at `.claude/skills/frontend-design/SKILL.md`.

### Design Rules Built Into Your Workspace:
- **Animations**: Framer Motion scroll reveals, staggered list entrances, hover scaling, and progress gauges.
- **Color System**: Dark glassmorphism (`bg-white/[0.03]`, `glass-panel`), electric blue glow (`hsl(212 100% 60%)`), emerald (`#10b981`), and amber accents.
- **Typography**: `Space Grotesk` headers & `Inter` body typography scale.
- **8px Grid System**: Consistent spacing (`gap-4`, `p-6`, `space-y-4`).

---

## 🧩 Step 4: Integrating 21st.dev Components

To bring agency-level UI blocks into CareerForge:

1. Visit [21st.dev](https://21st.dev)
2. Copy a component snippet (e.g. Hero, Testimonials, Pricing, Feature Cards)
3. Paste into Claude Code CLI with this prompt:

> *"Integrate this 21st.dev component into `apps/web/src/routes/_app.landing.tsx` (or target page). Match it to our design tokens defined in our frontend-design skill, replace placeholder copy with CareerForge branding, and add Framer Motion entrance animations."*

---

## 📋 Starter Prompts for Claude Code

Once Claude Code is running in your terminal, use these ready-to-copy prompts:

### 🌟 1. Build / Polish Landing Page
```text
Enhance the landing page at apps/web/src/routes/index.tsx using Framer Motion and our frontend-design skill.

Requirements:
- Add a hero section with a gradient headline, CTA buttons, and floating glass preview cards.
- Add an animated 4-step workflow: ATS Scanner -> Resume Builder -> AI Interviewer -> Job Tracker.
- Add staggered scroll-reveal animations on feature cards.
- Follow our 8px grid and glassmorphism design tokens.
- Ensure full mobile responsiveness.
```

### 🎯 2. Add New Feature / Component
```text
Build a new AI Resume Optimizer section in apps/web/src/routes/_app.resumes.$id.tsx.

Requirements:
- Use Framer Motion for entrance animations and tab transitions.
- Include a 1-click 'Auto-Fix ATS Keywords' button.
- Follow our design system in .claude/skills/frontend-design/SKILL.md.
```

---

## 💻 Local Development Commands

```bash
# Install dependencies
npm install

# Start full monorepo development server (Web & API)
npm run dev

# Run Prisma database migrations
npm run db:push --workspace=@careerforge/api

# Build for production
npm run build
```

---

## 🚢 Deployment Status
* **Live GitHub Repo**: `https://github.com/luqmxn07/career-forge`
* **Production Deployment**: Connected to Render CI/CD (`main` branch auto-deploys).
