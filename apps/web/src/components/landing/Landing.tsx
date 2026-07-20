"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type ComponentType,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  FileText,
  ScanLine,
  PenLine,
  MessagesSquare,
  KanbanSquare,
  LineChart,
  Check,
  Plus,
  Minus,
  Star,
  ChevronDown,
  Zap,
  Shield,
  Rocket,
  Target,
  Award,
  Brain,
  Send,
  Play,
  Github,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/features/profile/api/profile";
import { useDashboardStats } from "@/features/dashboard/api/dashboard";
import { useLogout } from "@/features/auth/api/auth";

/* ------------------------------- primitives ------------------------------- */

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
  href?: string;
  to?: string;
  onClick?: () => void;
}

function MagneticButton({
  children,
  className = "",
  variant = "primary",
  href,
  to,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-all cursor-pointer select-none";
  const styles =
    variant === "primary"
      ? "text-primary-foreground bg-primary shadow-lg hover:shadow-primary/30 hover:brightness-110"
      : "text-foreground glass-panel border border-glass-border hover:border-primary/50 hover:bg-muted/40";

  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70 bg-[linear-gradient(120deg,#6366f1,#a855f7,#22d3ee)]" />
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        ref={ref as unknown as React.RefObject<HTMLButtonElement | null>}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: sx, y: sy }}
        className={`${base} ${styles} ${className} border-none bg-transparent`}
      >
        {content}
      </motion.button>
    );
  }

  if (to) {
    return (
      <motion.span style={{ x: sx, y: sy }} className="inline-block">
        <Link
          ref={ref as unknown as React.RefObject<HTMLAnchorElement | null>}
          to={to}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className={`${base} ${styles} ${className}`}
        >
          {content}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.a
      ref={ref as unknown as React.RefObject<HTMLAnchorElement | null>}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`${base} ${styles} ${className}`}
    >
      {content}
    </motion.a>
  );
}

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary border border-glass-border shadow-sm">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- shell ---------------------------------- */

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-1/3 -top-1/3 h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle_at_center,#4f46e5_0%,transparent_60%)] opacity-40 blur-3xl animate-aurora" />
      <div
        className="absolute -right-1/4 top-1/4 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle_at_center,#a855f7_0%,transparent_60%)] opacity-30 blur-3xl animate-aurora"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle_at_center,#22d3ee_0%,transparent_60%)] opacity-20 blur-3xl animate-aurora"
        style={{ animationDelay: "-12s" }}
      />
      <div className="absolute inset-0 grid-bg opacity-40" />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { token } = useAuthStore();
  const logoutMutation = useLogout();
  const isAuthenticated = !!token;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${scrolled ? "glass-strong" : "glass"}`}
      >
        <Link to="/" className="flex items-center gap-2 pl-2">
          <div className="relative h-7 w-7 rounded-lg bg-[linear-gradient(135deg,#22d3ee,#6366f1,#a855f7)] shadow-[0_0_20px_rgba(120,90,255,0.5)]">
            <div className="absolute inset-[3px] rounded-md bg-background flex items-center justify-center">
              <span className="font-display text-sm leading-none text-primary">C</span>
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">CareerForge</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {["Features", "FAQ"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="transition hover:text-foreground">
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
              >
                Dashboard
              </Link>
              <MagneticButton
                onClick={() => logoutMutation.mutate()}
                className="!px-4 !py-2 text-xs"
              >
                Sign out
              </MagneticButton>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block mr-2"
              >
                Sign in
              </Link>
              <MagneticButton to="/auth/signup" className="!px-4 !py-2 text-xs">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

/* --------------------------------- hero ----------------------------------- */

function Particles() {
  const dots = Array.from({ length: 30 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => {
        const size = 2 + (i % 4);
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const dur = 8 + (i % 7);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        );
      })}
    </div>
  );
}

function ResumeMockup({ variant = "hero" }: { variant?: "hero" | "small" }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 12 });
  const sry = useSpring(ry, { stiffness: 120, damping: 12 });

  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: profile } = useProfile();
  const { data: stats } = useDashboardStats();

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  // Pull dynamic metrics or fall back to default
  const name = isAuthenticated && profile?.fullName ? profile.fullName : "Alex Chen";
  const role =
    isAuthenticated && profile?.experiences?.[0]?.role
      ? profile.experiences[0].role
      : "2nd Year CS Student · UEM";
  const score =
    isAuthenticated && ((stats as any)?.atsAverageScore !== undefined || (stats as any)?.averageAtsScore !== undefined)
      ? ((stats as any).atsAverageScore ?? (stats as any).averageAtsScore)
      : 96;
  const skills =
    isAuthenticated && profile?.skills?.length
      ? profile.skills.slice(0, 6)
      : ["Figma", "React", "Design Systems", "AI/ML", "Prototyping", "User Research"];

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className={`relative mx-auto ${variant === "hero" ? "w-full max-w-[560px]" : "w-full max-w-[420px]"}`}
    >
      <div className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-2xl" />
      <div className="relative rounded-3xl glass-panel shadow-2xl p-6 text-left border border-glass-border">
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Resume · live</div>
            <div className="mt-1 font-display text-xl text-foreground font-bold">{name}</div>
            <div className="text-xs text-muted-foreground">{role}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              ATS Score
            </div>
            <div className="text-2xl font-bold text-primary">{score}%</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {[
            { label: "Experience", w: isAuthenticated ? "90%" : "92%" },
            { label: "Skills", w: isAuthenticated ? "85%" : "88%" },
            { label: "Keywords", w: `${score}%` },
          ].map((row, i) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                <span>{row.label}</span>
                <span>{row.w}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: row.w }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {skills.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-lg border border-glass-border bg-card/50 px-2.5 py-1.5 text-[11px] text-foreground font-medium flex items-center justify-between"
            >
              <span>{t}</span>
              <Check className="h-3 w-3 text-emerald-400" />
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <Check className="h-3.5 w-3.5" /> Checked & Optimized
          </div>
          <div className="text-[10px] text-emerald-300/70">Sync</div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-16"
    >
      <Particles />
      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center"
      >
        <div className="lg:col-span-6 text-left">
          <FadeIn>
            <SectionEyebrow icon={Sparkles}>Introducing CareerForge 2.0</SectionEyebrow>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.98] tracking-tight text-foreground">
              Forge Your Career
              <br />
              <span className="text-gradient-primary italic">With AI</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The career operating system that writes ATS-ready resumes, crafts tailored cover
              letters, coaches you through interviews, and tracks every opportunity — so you land
              the offer.
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <MagneticButton to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              ) : (
                <MagneticButton to="/auth/signup">
                  Get started for free
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              )}
              <MagneticButton href="#features" variant="ghost">
                Explore Features
              </MagneticButton>
            </div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-10 flex items-center gap-6 text-xs text-white/50">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span>Secure & Private Data</span>
              </div>
              <div className="h-4 w-px bg-white/15" />
              <div>100% Free & Open Source</div>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-6 relative">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ResumeMockup />
          </motion.div>

          {/* Floating ATS Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -top-4 -right-4 glass-panel border border-glass-border p-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md hidden sm:flex"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              96%
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">ATS Match Gauge</div>
              <div className="text-[10px] text-emerald-400 font-medium">Top 5% candidate match</div>
            </div>
          </motion.div>

          {/* Floating STAR AI Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -bottom-6 -left-4 glass-panel border border-glass-border p-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md hidden sm:flex"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">STAR AI Bullet Optimizer</div>
              <div className="text-[10px] text-muted-foreground font-medium">Auto-tailored for job role</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40"
      >
        <div className="flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}

/* --------------------------- 3. Resume Builder ---------------------------- */

function ResumeBuilder() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sections = ["Header", "Experience", "Skills", "Projects"];
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start text-left">
          <SectionEyebrow icon={FileText}>Resume Builder</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              A resume that <span className="text-gradient italic">writes itself</span>.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Every section expands as you scroll — experience, skills, and projects. Each
              block animates in with AI-suggested content you can edit in one click.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8">
              <MagneticButton to={isAuthenticated ? "/resumes" : "/auth/signup"}>
                Open Resume Builder
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-7 text-left">
          <div className="space-y-4">
            {sections.map((s, i) => {
              const start = i / sections.length;
              const end = (i + 1) / sections.length;
              return (
                <BuilderBlock
                  key={s}
                  title={s}
                  index={i}
                  progress={scrollYProgress}
                  start={start}
                  end={end}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface BuilderBlockProps {
  title: string;
  index: number;
  progress: MotionValue<number>;
  start: number;
  end: number;
}

function BuilderBlock({ title, index, progress, start, end }: BuilderBlockProps) {
  const opacity = useTransform(progress, [start, start + 0.05, end], [0.3, 1, 1]);
  const yy = useTransform(progress, [start, end], [40, 0]);
  const scale = useTransform(progress, [start, start + 0.1], [0.96, 1]);

  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: profile } = useProfile();
  const name = isAuthenticated && profile?.fullName ? profile.fullName : "Alex Chen";
  const location = isAuthenticated && profile?.location ? profile.location : "San Francisco";
  const email = isAuthenticated && profile?.email ? profile.email : "alex@forge.co";

  const content: Record<string, ReactNode> = {
    Header: (
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-foreground font-bold">{name}</div>
          <div className="text-sm text-primary font-medium">2nd Year CS Student · {location === "San Francisco" ? "University of Engineering and Management (UEM)" : location}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground font-mono">
          <div>{email}</div>
          <div className="mt-0.5 text-[10px] text-emerald-400 font-semibold">Still Learning & Building</div>
        </div>
      </div>
    ),
    Experience: (
      <div className="space-y-3">
        {isAuthenticated && profile?.experiences?.length
          ? profile.experiences.slice(0, 2).map((e, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between border-l-2 border-primary/50 pl-4"
              >
                <div>
                  <div className="text-foreground font-semibold">{e.role}</div>
                  <div className="text-sm text-muted-foreground">{e.company}</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {e.startDate || "2024"} — {e.endDate || "Present"}
                </div>
              </div>
            ))
          : [
              { c: "University of Engineering and Management (UEM)", r: "2nd Year Computer Science Student", y: "2024 — Present" },
              { c: "Building AI & Web Applications", r: "Software Engineering Learner", y: "2024 — Present" },
            ].map((e) => (
              <div
                key={e.c}
                className="flex items-start justify-between border-l-2 border-primary/50 pl-4"
              >
                <div>
                  <div className="text-foreground font-semibold">{e.r}</div>
                  <div className="text-sm text-muted-foreground">{e.c}</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{e.y}</div>
              </div>
            ))}
      </div>
    ),
    Skills: (
      <div className="flex flex-wrap gap-2">
        {(isAuthenticated && profile?.skills?.length
          ? profile.skills.slice(0, 8)
          : [
              "Design Systems",
              "Motion",
              "AI/UX",
              "React",
              "Prototyping",
              "Figma",
              "Research",
              "Strategy",
            ]
        ).map((k) => (
          <div
            key={k}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80"
          >
            {k}
          </div>
        ))}
      </div>
    ),
    Projects: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { t: "Core Application v2", m: "Optimized parsing" },
          { t: "Interface Redesign", m: "Custom layouts" },
        ].map((p) => (
          <div key={p.t} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm text-white">{p.t}</div>
            <div className="mt-1 text-xs text-cyan-200/80">{p.m}</div>
          </div>
        ))}
      </div>
    ),
    Achievements: (
      <div className="space-y-2">
        {[
          "Verified ATS Compliance",
          "Visual Architect Portfolio",
          "System Engineering Certification",
        ].map((a) => (
          <div key={a} className="flex items-center gap-2 text-sm text-white/80">
            <Award className="h-4 w-4 text-amber-300" />
            {a}
          </div>
        ))}
      </div>
    ),
  };
  return (
    <motion.div style={{ opacity, y: yy, scale }} className="rounded-3xl glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-white/50">
          0{index + 1} · {title}
        </div>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
          <motion.div
            style={{ width: useTransform(progress, [start, end], ["0%", "100%"]) }}
            className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7)]"
          />
        </div>
      </div>
      {content[title]}
    </motion.div>
  );
}

/* ---------------------------- 4. ATS Scanner ----------------------------- */

function ATSScanner() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: stats } = useDashboardStats();

  const score =
    isAuthenticated && ((stats as any)?.atsAverageScore !== undefined || (stats as any)?.averageAtsScore !== undefined)
      ? ((stats as any).atsAverageScore ?? (stats as any).averageAtsScore)
      : 96;

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={ScanLine}>ATS Scanner</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              See exactly what recruiters see.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-lg text-white/70">
              Paste any job description. We scan your resume against 200+ ATS signals in seconds.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2}>
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.28),transparent_70%)] blur-3xl" />
            <div className="relative grid overflow-hidden rounded-3xl glass-strong glow-blue md:grid-cols-2 text-left">
              {/* Before */}
              <div className="border-b border-white/10 p-8 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
                  <span>Before Optimization</span>
                  <span className="text-rose-300">42 / 100</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded bg-white/10"
                      style={{ width: `${60 + ((i * 5) % 40)}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["missing: React", "missing: TypeScript", "weak verbs"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 text-[10px] text-rose-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* After */}
              <div className="relative p-8">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
                  <span>After Optimization</span>
                  <span className="text-emerald-300">{score} / 100</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const hl = [1, 3, 5].includes(i);
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.6 }}
                        style={{ transformOrigin: "left", width: `${75 + ((i * 7) % 25)}%` }}
                        className={`h-2 rounded ${hl ? "bg-[linear-gradient(90deg,#22d3ee,#a855f7)]" : "bg-white/40"}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "0-to-1", "Systems", "Growth"].map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-200"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  aria-hidden
                  animate={{ y: ["-10%", "110%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-x-6 top-0 h-14 rounded-full bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.35),transparent)] blur-md"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <MagneticButton to={isAuthenticated ? "/ats" : "/auth/signup"}>
                Try ATS Scanner
                <ScanLine className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* --------------------------- 5. Cover Letter ------------------------------ */

function useTyped(text: string, start: boolean, speed = 20) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!start) return;
    let i = 0;
    setOut("");
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, start, speed]);
  return out;
}

function CoverLetter() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold: 0.4,
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const prompt = "Write a cover letter for a Senior Product Designer role at Stripe.";
  const letter =
    "Dear Stripe hiring team,\n\nDesigning payments infrastructure is designing trust at planetary scale. Over the last six years I've shipped systems used by millions — from Figma's community platform to Stripe Terminal's next-generation flows. I obsess over the surface area where craft and clarity meet.\n\nI'd love to bring that obsession to your team.\n\nWarmly,\nAlex";

  const typedPrompt = useTyped(prompt, inView, 25);
  const [showLetter, setShowLetter] = useState(false);
  useEffect(() => {
    if (typedPrompt === prompt) {
      const t = setTimeout(() => setShowLetter(true), 500);
      return () => clearTimeout(t);
    }
  }, [typedPrompt, prompt]);

  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5 text-left">
          <SectionEyebrow icon={PenLine}>AI Cover Letter</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Letters that sound like <span className="text-gradient italic">you</span>.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Describe the role. CareerForge weaves in your voice, your wins, and the company's tone
              in seconds.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8">
              <MagneticButton to={isAuthenticated ? "/cover-letters" : "/auth/signup"}>
                Generate Cover Letter
                <Sparkles className="h-4 w-4" />
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-7 text-left">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_65%)] blur-3xl" />
            <div className="relative rounded-3xl glass-strong p-6 glow-blue">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">
                  Prompt Input
                </div>
                <div className="min-h-[3rem] text-white/90 font-mono text-sm">
                  {typedPrompt}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-cyan-300"
                  />
                </div>
              </div>
              <AnimatePresence>
                {showLetter && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 whitespace-pre-line font-serif text-[15px] leading-relaxed text-white/85"
                  >
                    {letter}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- 6. Interview Coach --------------------------- */

function InterviewCoach() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  const messages = [
    {
      from: "ai" as const,
      text: "Tell me about a time you shipped something under impossible constraints.",
    },
    {
      from: "you" as const,
      text: "At Figma we had six weeks to launch a new plugin surface. I split scope into three phases…",
    },
    {
      from: "ai" as const,
      text: "Great structure. Try quantifying the impact — how many plugins shipped week one?",
    },
  ];
  return (
    <section className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5 lg:order-2 text-left">
          <SectionEyebrow icon={MessagesSquare}>Interview Coach</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Practice until it feels <span className="text-gradient italic">effortless</span>.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Realtime conversation with an AI interviewer trained on 20,000+ real hiring loops.
              Live feedback. Confidence you can measure.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-8">
              <MagneticButton to={isAuthenticated ? "/interviews" : "/auth/signup"}>
                Practice Interview
                <Brain className="h-4 w-4" />
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-7 lg:order-1 text-left">
          <div className="relative">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_70%)] blur-3xl" />
            <div className="relative rounded-3xl glass-strong p-6 glow-blue">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live · Behavioral round
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">
                    Confidence
                  </div>
                  <div className="text-lg text-gradient font-semibold">84%</div>
                </div>
              </div>
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.25, duration: 0.6 }}
                    className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "you" ? "bg-[linear-gradient(120deg,#6366f1,#a855f7)] text-white" : "border border-white/10 bg-white/5 text-white/85"}`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">
                <div className="mb-1 uppercase tracking-widest text-amber-300/80">
                  Coach feedback
                </div>
                Strong structural framework. Consider adding exact volume parameters to highlight
                execution speed.
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "84%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ 7. Kanban -------------------------------- */

function JobTrackerSection() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: stats } = useDashboardStats();

  const sAny = stats as any;
  const cWish = sAny?.kanban?.wishlist !== undefined ? sAny.kanban.wishlist : 2;
  const cApp = sAny?.kanban?.applied !== undefined ? sAny.kanban.applied : 2;
  const cInt = sAny?.kanban?.interview !== undefined ? sAny.kanban.interview : 2;
  const cOff = sAny?.kanban?.offer !== undefined ? sAny.kanban.offer : 1;
  const cRej = sAny?.kanban?.rejected !== undefined ? sAny.kanban.rejected : 1;

  const kanbanCols = [
    {
      title: "Wishlist",
      count: cWish,
      accent: "from-slate-400/40 to-slate-400/0",
      cards: ["Anthropic · Design Eng", "Vercel · Sr Designer"],
    },
    {
      title: "Applied",
      count: cApp,
      accent: "from-cyan-400/40 to-cyan-400/0",
      cards: ["Stripe · Product Design", "Notion · Brand"],
    },
    {
      title: "Interview",
      count: cInt,
      accent: "from-indigo-400/40 to-indigo-400/0",
      cards: ["Linear · Design", "Figma · Systems"],
    },
    {
      title: "Offer",
      count: cOff,
      accent: "from-emerald-400/40 to-emerald-400/0",
      cards: ["Framer · Sr IC"],
    },
    {
      title: "Rejected",
      count: cRej,
      accent: "from-rose-400/40 to-rose-400/0",
      cards: ["Airbnb · Growth"],
    },
  ];

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={KanbanSquare}>Job Tracker</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Every application, one board.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-lg text-white/70">
              Drag, drop, and never lose track of an opportunity again.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.15}>
          <div className="relative mx-auto mt-14 max-w-6xl overflow-x-auto">
            <div className="grid min-w-[900px] grid-cols-5 gap-4 text-left">
              {kanbanCols.map((col, ci) => (
                <div key={col.title} className="rounded-2xl glass p-3">
                  <div
                    className={`mb-3 flex items-center justify-between rounded-lg bg-gradient-to-r ${col.accent} px-3 py-1.5 text-xs`}
                  >
                    <span className="text-white font-medium">{col.title}</span>
                    <span className="text-white/60 font-semibold">{col.count}</span>
                  </div>
                  <div className="space-y-2">
                    {col.cards.slice(0, col.count || 1).map((c, i) => (
                      <motion.div
                        key={c}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: ci * 0.08 + i * 0.06 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="cursor-grab rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/85 shadow-sm"
                      >
                        <div className="font-medium text-white">{c.split(" · ")[0]}</div>
                        <div className="mt-0.5 text-white/60">{c.split(" · ")[1]}</div>
                      </motion.div>
                    ))}
                    {col.count === 0 && (
                      <div className="text-[10px] text-white/20 text-center py-6 border border-dashed border-white/5 rounded-xl">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <div className="mt-10 text-center">
          <MagneticButton to={isAuthenticated ? "/job-tracker" : "/auth/signup"}>
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 8. Career Analytics -------------------------- */

function Metric({ label, value, unit = "" }: { label: string; value: number; unit?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setV(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="rounded-2xl glass p-6 text-left">
      <div className="text-xs uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-2 font-display text-5xl text-gradient">
        {v}
        {unit}
      </div>
    </div>
  );
}

function Chart() {
  const bars = [30, 42, 55, 48, 66, 78, 72, 88, 96];
  return (
    <div className="flex h-40 items-end gap-2 rounded-2xl glass p-6">
      {bars.map((b, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${b}%` }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-t bg-[linear-gradient(180deg,#22d3ee,#6366f1,#a855f7)]"
        />
      ))}
    </div>
  );
}

function Analytics() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: stats } = useDashboardStats();

  const sAny = stats as any;
  const totalApps =
    isAuthenticated && sAny?.kanban
      ? sAny.kanban.wishlist +
        sAny.kanban.applied +
        sAny.kanban.interview +
        sAny.kanban.offer +
        sAny.kanban.rejected
      : 128;
  const score =
    isAuthenticated && (sAny?.atsAverageScore !== undefined || sAny?.averageAtsScore !== undefined)
      ? (sAny.atsAverageScore ?? sAny.averageAtsScore)
      : 96;
  const interviewsCount = isAuthenticated && sAny?.interviews !== undefined ? sAny.interviews : 8;

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={LineChart}>Career Analytics</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Data that <span className="text-gradient italic">moves the needle</span>.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-lg text-white/70">
              Track every signal that matters — from ATS score to response rate.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2}>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            <Metric label="Applications" value={totalApps} />
            <Metric label="ATS Score" value={score} />
            <Metric label="Interviews" value={interviewsCount} />
            <Metric label="Success Rate" value={68} unit="%" />
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mt-6">
            <Chart />
          </div>
        </FadeIn>
        <div className="mt-10 text-center">
          <MagneticButton to={isAuthenticated ? "/dashboard" : "/auth/signup"}>
            View Analytics
            <LineChart className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- 9. Ecosystem orbit --------------------------- */

function Ecosystem() {
  const modules = [
    { label: "Resume", icon: FileText },
    { label: "ATS", icon: ScanLine },
    { label: "Cover Letter", icon: PenLine },
    { label: "Interview", icon: MessagesSquare },
    { label: "Tracker", icon: KanbanSquare },
    { label: "Analytics", icon: LineChart },
  ];
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <SectionEyebrow icon={Sparkles}>The ecosystem</SectionEyebrow>
        <FadeIn>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
            Everything you need to <span className="text-gradient italic">land your dream job</span>
            .
          </h2>
        </FadeIn>

        <div className="relative mx-auto mt-20 h-[560px] w-full max-w-[640px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-2xl" />
          {[0.55, 0.78, 1].map((s, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 40 + i * 10, repeat: Infinity, ease: "linear" }}
              style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            />
          ))}
          {/* center resume */}
          <div className="absolute left-1/2 top-1/2 w-52 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ResumeMockup variant="small" />
            </motion.div>
          </div>
          {/* orbiting modules */}
          {modules.map((m, i) => {
            const angle = (i / modules.length) * Math.PI * 2;
            const r = 240;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.7 }}
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-2 rounded-full glass-strong px-4 py-2 text-xs text-white/90 shadow-lg"
                >
                  <m.icon className="h-3.5 w-3.5 text-cyan-300" />
                  {m.label}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- 12. FAQ -------------------------------- */

const faqs = [
  {
    q: "How does CareerForge optimize my resume for ATS?",
    a: "We parse the target job, extract the semantic keywords ATS systems weight most, then rewrite your resume to match while keeping your voice intact.",
  },
  {
    q: "Is my data private?",
    a: "Yes — encrypted at rest and in transit, and we never train models on your personal content.",
  },
  {
    q: "Is it completely free?",
    a: "Absolutely. The core AI resume builder, cover letter compiler, and interview trainer features are 100% free.",
  },
  {
    q: "Which industries does it support?",
    a: "Tech, design, product, marketing, finance, healthcare, and 40+ more.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <SectionEyebrow icon={Shield}>FAQ</SectionEyebrow>
          <FadeIn>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Questions, answered.
            </h2>
          </FadeIn>
        </div>
        <div className="mt-12 space-y-3 text-left">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-2xl glass px-5">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-5 text-left cursor-pointer"
                >
                  <span className="text-base text-white font-medium pr-4">{f.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-white/70">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-sm leading-relaxed text-white/70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- 13. CTA + Footer ------------------------ */

function FinalCTA() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[36px] glass-strong p-14 text-center">
          <div className="absolute -inset-16 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_65%)] blur-3xl" />
          <div className="relative">
            <SectionEyebrow icon={Zap}>Your next chapter</SectionEyebrow>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">
              Forge your career. <span className="text-gradient italic">Today.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">
              Forge your resumes, prep for interviews, and land offers you love with the ultimate
              career compiler.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <MagneticButton to={isAuthenticated ? "/dashboard" : "/auth/signup"}>
                Get started now
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-glass-border pt-16 pb-10">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 text-left">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-lg bg-[linear-gradient(135deg,#22d3ee,#6366f1,#a855f7)]">
              <div className="absolute inset-[3px] rounded-md bg-background flex items-center justify-center">
                <span className="font-display text-sm text-primary font-bold">C</span>
              </div>
            </div>
            <span className="text-base font-bold text-foreground">CareerForge</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            An AI Career Platform built as a passion project by a <strong className="text-foreground">2nd year CS student</strong> at <strong className="text-foreground">University of Engineering and Management (UEM)</strong> for fun and learning.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://github.com/luqmxn07/career-forge"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full glass-panel border border-glass-border px-4 py-2 font-medium text-foreground hover:border-primary/50 transition-all"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span>View Source on GitHub</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:col-span-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Platform Tools</div>
            <ul className="mt-4 space-y-2 text-sm font-medium">
              {[
                { name: "Resume Builder", to: "/resumes" },
                { name: "ATS Match Scanner", to: "/ats" },
                { name: "Cover Letter Generator", to: "/cover-letters" },
                { name: "AI Interview Coach", to: "/interviews" },
                { name: "Job Tracker Pipeline", to: "/job-tracker" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.to} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">About Project</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>🎓 2nd Year CS Student</li>
              <li>🏛️ UEM (University of Engineering & Management)</li>
              <li>⚡ Built for Fun & Learning</li>
              <li>🚀 React 19 + AI Gateway</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-glass-border px-6 pt-6 text-xs text-muted-foreground">
        <div>© {new Date().getFullYear()} CareerForge · Built for fun & learning by a 2nd year CS student at UEM.</div>
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          University of Engineering and Management (UEM)
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------- Landing -------------------------------- */

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Aurora />
      <Nav />
      <main>
        <Hero />
        <ResumeBuilder />
        <ATSScanner />
        <CoverLetter />
        <InterviewCoach />
        <JobTrackerSection />
        <Analytics />
        <Ecosystem />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
