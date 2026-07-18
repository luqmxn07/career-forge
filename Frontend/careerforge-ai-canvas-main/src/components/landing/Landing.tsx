"use client";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Sparkles, FileText, ScanLine, PenLine, MessagesSquare,
  KanbanSquare, LineChart, Check, Plus, Minus, Star,
  ChevronDown, Zap, Shield, Rocket, Target, Award, Brain,
  Send, Globe, AtSign, Play,
} from "lucide-react";

/* ------------------------------- primitives ------------------------------- */

function MagneticButton({
  children, className = "", variant = "primary", href = "#",
}: { children: ReactNode; className?: string; variant?: "primary" | "ghost"; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const base = "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors";
  const styles = variant === "primary"
    ? "text-white shadow-[0_10px_40px_-10px_rgba(120,90,255,0.6)] bg-[linear-gradient(120deg,#6366f1,#a855f7_60%,#22d3ee)]"
    : "text-white/90 glass hover:text-white";

  return (
    <motion.a
      ref={ref} href={href} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`${base} ${styles} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70 bg-[linear-gradient(120deg,#6366f1,#a855f7,#22d3ee)]" />
      )}
    </motion.a>
  );
}

function SectionEyebrow({ icon: Icon, children }: { icon: any; children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/70">
      <Icon className="h-3.5 w-3.5 text-white/70" />
      {children}
    </div>
  );
}

function FadeIn({ children, delay = 0, y = 24 }: { children: ReactNode; delay?: number; y?: number }) {
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
      <div className="absolute -right-1/4 top-1/4 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle_at_center,#a855f7_0%,transparent_60%)] opacity-30 blur-3xl animate-aurora" style={{ animationDelay: "-6s" }} />
      <div className="absolute bottom-0 left-1/3 h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle_at_center,#22d3ee_0%,transparent_60%)] opacity-20 blur-3xl animate-aurora" style={{ animationDelay: "-12s" }} />
      <div className="absolute inset-0 grid-bg opacity-40" />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className={`flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${scrolled ? "glass-strong" : "glass"}`}>
        <a href="#" className="flex items-center gap-2 pl-2">
          <div className="relative h-7 w-7 rounded-lg bg-[linear-gradient(135deg,#22d3ee,#6366f1,#a855f7)] shadow-[0_0_20px_rgba(120,90,255,0.5)]">
            <div className="absolute inset-[3px] rounded-md bg-background/60 flex items-center justify-center">
              <span className="font-display text-sm leading-none text-white">C</span>
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight">CareerForge</span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-white/70 md:flex">
          {["Product", "Features", "Pricing", "FAQ"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="transition hover:text-white">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden text-sm text-white/70 hover:text-white sm:inline-block">Sign in</a>
          <MagneticButton href="#pricing" className="!px-4 !py-2 text-xs">Get started<ArrowRight className="h-3.5 w-3.5" /></MagneticButton>
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
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, filter: "blur(0.5px)" }}
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
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className={`relative mx-auto ${variant === "hero" ? "w-full max-w-[560px]" : "w-full max-w-[420px]"}`}
    >
      <div className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-2xl" />
      <div className="relative rounded-3xl glass-strong glow-blue p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">Resume · v3.2</div>
            <div className="mt-1 font-display text-xl text-white">Alex Chen</div>
            <div className="text-xs text-white/60">Senior Product Designer</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300/80">ATS Score</div>
            <div className="text-2xl font-semibold text-gradient">96</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {[
            { label: "Experience", w: "92%" },
            { label: "Skills", w: "88%" },
            { label: "Keywords", w: "96%" },
          ].map((row, i) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-white/50">
                <span>{row.label}</span><span>{row.w}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: row.w }} viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#6366f1,#a855f7)]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {["Figma", "React", "Design Systems", "AI/ML", "Prototyping", "User Research"].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/80"
            >
              {t}
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <Check className="h-3.5 w-3.5" /> Optimized for Stripe · Senior Designer
          </div>
          <div className="text-[10px] text-emerald-300/70">Live</div>
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

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-16">
      <Particles />
      <motion.div style={{ y, opacity }} className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <FadeIn>
            <SectionEyebrow icon={Sparkles}>Introducing CareerForge 2.0</SectionEyebrow>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.98] tracking-tight text-white">
              Forge Your Career
              <br />
              <span className="text-gradient italic">With AI</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              The career operating system that writes ATS-ready resumes, crafts tailored cover letters,
              coaches you through interviews, and tracks every opportunity — so you land the offer.
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton href="#pricing">Start free trial<ArrowRight className="h-4 w-4" /></MagneticButton>
              <MagneticButton href="#story" variant="ghost">Watch the story</MagneticButton>
            </div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-10 flex items-center gap-6 text-xs text-white/50">
              <div className="flex items-center gap-1.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />)}<span className="ml-1">4.9 · 12k users</span></div>
              <div className="hidden h-4 w-px bg-white/15 sm:block" />
              <div className="hidden sm:block">Trusted at Stripe · Linear · Figma</div>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-6">
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
            <ResumeMockup />
          </motion.div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40">
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

/* -------------------------- 2. sticky ATS story --------------------------- */

const atsSteps = [
  { title: "Blank canvas", desc: "Start from zero — or drop in an existing resume. CareerForge sees every gap.", tag: "Step 01", score: 12 },
  { title: "Parsing your story", desc: "We extract every role, skill, and achievement into structured, editable blocks.", tag: "Step 02", score: 42 },
  { title: "Matching the job", desc: "Semantic analysis maps your history to the exact keywords recruiters search for.", tag: "Step 03", score: 71 },
  { title: "Optimized for ATS", desc: "Beautifully formatted, keyword-perfect, ready to pass every applicant tracking system.", tag: "Step 04", score: 96 },
];

function StickyATS() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(atsSteps.length - 1, Math.floor(v * atsSteps.length));
    setActive(idx);
  });
  const step = atsSteps[active];

  return (
    <section id="story" ref={ref} className="relative" style={{ height: "380vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <SectionEyebrow icon={ScanLine}>ATS Optimization</SectionEyebrow>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-white/50">
              <span className="text-white/80">{step.tag}</span>
              <div className="h-px w-16 bg-white/15" />
              <span>{active + 1} / {atsSteps.length}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-white md:text-6xl">{step.title}</h2>
                <p className="mt-5 max-w-md text-lg text-white/70">{step.desc}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8">
              <div className="mb-2 flex items-baseline justify-between text-xs uppercase tracking-widest text-white/50">
                <span>ATS Score</span><span className="text-white">{step.score}/100</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div animate={{ width: `${step.score}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#6366f1,#a855f7)]" />
              </div>
            </div>
            <div className="mt-8">
              <MagneticButton href="#pricing" variant="ghost">Learn more<ArrowUpRight className="h-4 w-4" /></MagneticButton>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-10 rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_65%)] blur-3xl" />
              <div className="relative aspect-[4/5] w-full rounded-3xl glass-strong p-6 glow-blue">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/50">
                  <span>resume.pdf</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">Live scan</span>
                </div>

                <div className="mt-5 space-y-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const filled = i / 14 < active / (atsSteps.length - 1) + 0.15;
                    const highlight = active >= 2 && (i === 2 || i === 6 || i === 10);
                    return (
                      <motion.div
                        key={i}
                        animate={{ opacity: filled ? 1 : 0.15, scaleX: filled ? 1 : 0.4 }}
                        transition={{ duration: 0.6, delay: i * 0.02 }}
                        style={{ transformOrigin: "left" }}
                        className={`h-2.5 rounded ${highlight ? "bg-[linear-gradient(90deg,#22d3ee,#a855f7)]" : "bg-white/25"}`}
                      />
                    );
                  })}
                </div>

                <AnimatePresence>
                  {active >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-6 grid grid-cols-3 gap-2"
                    >
                      {["React", "TypeScript", "Systems", "Leadership", "Growth", "0-to-1"].map((k, i) => (
                        <motion.div key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="rounded-lg border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1.5 text-center text-[11px] text-cyan-100">
                          {k}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  aria-hidden
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-x-6 top-16 h-16 rounded-3xl bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.3),transparent)] blur-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- 3. Resume Builder ---------------------------- */

function ResumeBuilder() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sections = ["Header", "Experience", "Skills", "Projects", "Achievements"];
  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <SectionEyebrow icon={FileText}>Resume Builder</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">A resume that <span className="text-gradient italic">writes itself</span>.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 max-w-md text-lg text-white/70">Every section expands as you scroll — experience, skills, projects, achievements. Each block animates in with AI-suggested content you can edit in one click.</p></FadeIn>
          <FadeIn delay={0.2}><div className="mt-8"><MagneticButton href="#">Open Resume Builder<ArrowRight className="h-4 w-4" /></MagneticButton></div></FadeIn>
        </div>

        <div className="lg:col-span-7">
          <div className="space-y-4">
            {sections.map((s, i) => {
              const start = i / sections.length;
              const end = (i + 1) / sections.length;
              return <BuilderBlock key={s} title={s} index={i} progress={scrollYProgress} start={start} end={end} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderBlock({ title, index, progress, start, end }: any) {
  const opacity = useTransform(progress, [start, start + 0.05, end], [0.3, 1, 1]);
  const yy = useTransform(progress, [start, end], [40, 0]);
  const scale = useTransform(progress, [start, start + 0.1], [0.96, 1]);
  const content: Record<string, ReactNode> = {
    Header: (
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-white">Alex Chen</div>
          <div className="text-sm text-white/60">Senior Product Designer · San Francisco</div>
        </div>
        <div className="text-right text-xs text-white/60"><div>alex@forge.co</div><div>alexchen.design</div></div>
      </div>
    ),
    Experience: (
      <div className="space-y-3">
        {[
          { c: "Stripe", r: "Senior Product Designer", y: "2022 — Now" },
          { c: "Figma", r: "Product Designer", y: "2019 — 2022" },
        ].map((e) => (
          <div key={e.c} className="flex items-start justify-between border-l-2 border-white/15 pl-4">
            <div><div className="text-white">{e.r}</div><div className="text-sm text-white/60">{e.c}</div></div>
            <div className="text-xs text-white/50">{e.y}</div>
          </div>
        ))}
      </div>
    ),
    Skills: (
      <div className="flex flex-wrap gap-2">
        {["Design Systems", "Motion", "AI/UX", "React", "Prototyping", "Figma", "Research", "Strategy"].map((k) => (
          <div key={k} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">{k}</div>
        ))}
      </div>
    ),
    Projects: (
      <div className="grid grid-cols-2 gap-3">
        {[{ t: "Stripe Terminal 2.0", m: "+38% activation" }, { t: "Design System v3", m: "180 components" }].map((p) => (
          <div key={p.t} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm text-white">{p.t}</div>
            <div className="mt-1 text-xs text-cyan-200/80">{p.m}</div>
          </div>
        ))}
      </div>
    ),
    Achievements: (
      <div className="space-y-2">
        {["Speaker · Config 2024", "Design Awards · Site of the Day", "Patent · Adaptive UI Systems"].map((a) => (
          <div key={a} className="flex items-center gap-2 text-sm text-white/80"><Award className="h-4 w-4 text-amber-300" />{a}</div>
        ))}
      </div>
    ),
  };
  return (
    <motion.div style={{ opacity, y: yy, scale }} className="rounded-3xl glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-white/50">0{index + 1} · {title}</div>
        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10"><motion.div style={{ width: useTransform(progress, [start, end], ["0%", "100%"]) }} className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7)]" /></div>
      </div>
      {content[title]}
    </motion.div>
  );
}

/* ---------------------------- 4. ATS Scanner ----------------------------- */

function ATSScanner() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={ScanLine}>ATS Scanner</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">See exactly what recruiters see.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 text-lg text-white/70">Paste any job description. We scan your resume against 200+ ATS signals in seconds.</p></FadeIn>
        </div>

        <FadeIn delay={0.2}>
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.28),transparent_70%)] blur-3xl" />
            <div className="relative grid overflow-hidden rounded-3xl glass-strong glow-blue md:grid-cols-2">
              {/* Before */}
              <div className="border-b border-white/10 p-8 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
                  <span>Before</span><span className="text-rose-300">42 / 100</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-2 rounded bg-white/10" style={{ width: `${60 + (i * 5) % 40}%` }} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["missing: React", "missing: TypeScript", "weak verbs"].map((t) => (
                    <span key={t} className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 text-[10px] text-rose-200">{t}</span>
                  ))}
                </div>
              </div>
              {/* After */}
              <div className="relative p-8">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
                  <span>After</span><span className="text-emerald-300">96 / 100</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const hl = [1, 3, 5].includes(i);
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.6 }}
                        style={{ transformOrigin: "left", width: `${75 + (i * 7) % 25}%` }}
                        className={`h-2 rounded ${hl ? "bg-[linear-gradient(90deg,#22d3ee,#a855f7)]" : "bg-white/40"}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "0-to-1", "Systems", "Growth"].map((t, i) => (
                    <motion.span key={t} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.06 }} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-200">{t}</motion.span>
                  ))}
                </div>
                <motion.div
                  aria-hidden animate={{ y: ["-10%", "110%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-x-6 top-0 h-14 rounded-full bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.35),transparent)] blur-md"
                />
              </div>
            </div>

            <div className="mt-8 text-center"><MagneticButton href="#">Try ATS Scanner<ScanLine className="h-4 w-4" /></MagneticButton></div>
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
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const prompt = "Write a cover letter for a Senior Product Designer role at Stripe.";
  const letter = "Dear Stripe hiring team,\n\nDesigning payments infrastructure is designing trust at planetary scale. Over the last six years I've shipped systems used by millions — from Figma's community platform to Stripe Terminal's next-generation flows. I obsess over the surface area where craft and clarity meet.\n\nI'd love to bring that obsession to your team.\n\nWarmly,\nAlex";

  const typedPrompt = useTyped(prompt, inView, 25);
  const [showLetter, setShowLetter] = useState(false);
  useEffect(() => { if (typedPrompt === prompt) { const t = setTimeout(() => setShowLetter(true), 500); return () => clearTimeout(t); } }, [typedPrompt, prompt]);

  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionEyebrow icon={PenLine}>AI Cover Letter</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Letters that sound like <span className="text-gradient italic">you</span>.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 max-w-md text-lg text-white/70">Describe the role. CareerForge weaves in your voice, your wins, and the company's tone in seconds.</p></FadeIn>
          <FadeIn delay={0.2}><div className="mt-8"><MagneticButton href="#">Generate Cover Letter<Sparkles className="h-4 w-4" /></MagneticButton></div></FadeIn>
        </div>

        <div className="lg:col-span-7">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_65%)] blur-3xl" />
            <div className="relative rounded-3xl glass-strong p-6 glow-blue">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-white/50">Prompt</div>
                <div className="min-h-[3rem] text-white/90">
                  {typedPrompt}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity }} className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-cyan-300" />
                </div>
              </div>
              <AnimatePresence>
                {showLetter && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 whitespace-pre-line font-serif text-[15px] leading-relaxed text-white/85">
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
  const messages = [
    { from: "ai" as const, text: "Tell me about a time you shipped something under impossible constraints." },
    { from: "you" as const, text: "At Figma we had six weeks to launch a new plugin surface. I split scope into three phases…" },
    { from: "ai" as const, text: "Great structure. Try quantifying the impact — how many plugins shipped week one?" },
  ];
  return (
    <section className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5 lg:order-2">
          <SectionEyebrow icon={MessagesSquare}>Interview Coach</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Practice until it feels <span className="text-gradient italic">effortless</span>.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 max-w-md text-lg text-white/70">Realtime conversation with an AI interviewer trained on 20,000+ real hiring loops. Live feedback. Confidence you can measure.</p></FadeIn>
          <FadeIn delay={0.2}><div className="mt-8"><MagneticButton href="#">Practice Interview<Brain className="h-4 w-4" /></MagneticButton></div></FadeIn>
        </div>

        <div className="lg:col-span-7 lg:order-1">
          <div className="relative">
            <div className="absolute -inset-8 rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_70%)] blur-3xl" />
            <div className="relative rounded-3xl glass-strong p-6 glow-blue">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60"><span className="h-2 w-2 rounded-full bg-emerald-400" />Live · Behavioral round</div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">Confidence</div>
                  <div className="text-lg text-gradient font-semibold">84%</div>
                </div>
              </div>
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.25, duration: 0.6 }} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "you" ? "bg-[linear-gradient(120deg,#6366f1,#a855f7)] text-white" : "border border-white/10 bg-white/5 text-white/85"}`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100">
                <div className="mb-1 uppercase tracking-widest text-amber-300/80">Coach note</div>
                Strong opener, structured STAR response. Consider adding a metric to strengthen impact.
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "84%" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ 7. Kanban -------------------------------- */

const kanbanCols = [
  { title: "Wishlist", accent: "from-slate-400/40 to-slate-400/0", cards: ["Anthropic · Design Eng", "Vercel · Sr Designer"] },
  { title: "Applied", accent: "from-cyan-400/40 to-cyan-400/0", cards: ["Stripe · Product Design", "Notion · Brand"] },
  { title: "Interview", accent: "from-indigo-400/40 to-indigo-400/0", cards: ["Linear · Design", "Figma · Systems"] },
  { title: "Offer", accent: "from-emerald-400/40 to-emerald-400/0", cards: ["Framer · Sr IC"] },
  { title: "Rejected", accent: "from-rose-400/40 to-rose-400/0", cards: ["Airbnb · Growth"] },
];

function JobTracker() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={KanbanSquare}>Job Tracker</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Every application, one board.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 text-lg text-white/70">Drag, drop, and never lose track of an opportunity again.</p></FadeIn>
        </div>
        <FadeIn delay={0.15}>
          <div className="relative mx-auto mt-14 max-w-6xl overflow-x-auto">
            <div className="grid min-w-[900px] grid-cols-5 gap-4">
              {kanbanCols.map((col, ci) => (
                <div key={col.title} className="rounded-2xl glass p-3">
                  <div className={`mb-3 flex items-center justify-between rounded-lg bg-gradient-to-r ${col.accent} px-3 py-1.5 text-xs`}>
                    <span className="text-white">{col.title}</span>
                    <span className="text-white/60">{col.cards.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.cards.map((c, i) => (
                      <motion.div
                        key={c}
                        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ delay: ci * 0.08 + i * 0.06 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="cursor-grab rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/85 shadow-sm"
                      >
                        <div className="font-medium text-white">{c.split(" · ")[0]}</div>
                        <div className="mt-0.5 text-white/60">{c.split(" · ")[1]}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <div className="mt-10 text-center"><MagneticButton href="#">Open Dashboard<ArrowRight className="h-4 w-4" /></MagneticButton></div>
      </div>
    </section>
  );
}

/* -------------------------- 8. Career Analytics -------------------------- */

function Metric({ label, value, unit = "" }: { label: string; value: number; unit?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
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
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="rounded-2xl glass p-6">
      <div className="text-xs uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-2 font-display text-5xl text-gradient">{v}{unit}</div>
    </div>
  );
}

function Chart() {
  const bars = [30, 42, 55, 48, 66, 78, 72, 88, 96];
  return (
    <div className="flex h-40 items-end gap-2 rounded-2xl glass p-6">
      {bars.map((b, i) => (
        <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${b}%` }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="w-full rounded-t bg-[linear-gradient(180deg,#22d3ee,#6366f1,#a855f7)]" />
      ))}
    </div>
  );
}

function Analytics() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={LineChart}>Career Analytics</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Data that <span className="text-gradient italic">moves the needle</span>.</h2></FadeIn>
          <FadeIn delay={0.1}><p className="mt-5 text-lg text-white/70">Track every signal that matters — from ATS score to response rate.</p></FadeIn>
        </div>
        <FadeIn delay={0.2}>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            <Metric label="Applications" value={128} />
            <Metric label="ATS Score" value={96} />
            <Metric label="Interview Rate" value={41} unit="%" />
            <Metric label="Success Rate" value={68} unit="%" />
          </div>
        </FadeIn>
        <FadeIn delay={0.3}><div className="mt-6"><Chart /></div></FadeIn>
        <div className="mt-10 text-center"><MagneticButton href="#">View Analytics<LineChart className="h-4 w-4" /></MagneticButton></div>
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
        <FadeIn><h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Everything you need to <span className="text-gradient italic">land your dream job</span>.</h2></FadeIn>

        <div className="relative mx-auto mt-20 h-[560px] w-full max-w-[640px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-2xl" />
          {[0.55, 0.78, 1].map((s, i) => (
            <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 40 + i * 10, repeat: Infinity, ease: "linear" }}
              style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            />
          ))}
          {/* center resume */}
          <div className="absolute left-1/2 top-1/2 w-52 -translate-x-1/2 -translate-y-1/2">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
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
                initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.7 }}
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 rounded-full glass-strong px-4 py-2 text-xs text-white/90 shadow-lg">
                  <m.icon className="h-3.5 w-3.5 text-cyan-300" />{m.label}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ 10. Pricing ------------------------------ */

function Pricing() {
  const [yearly, setYearly] = useState(true);
  const plans = [
    { name: "Free", price: { m: 0, y: 0 }, tag: "Start exploring", features: ["1 resume", "3 AI cover letters", "Basic ATS scan"], cta: "Get started" },
    { name: "Pro", price: { m: 19, y: 15 }, tag: "For serious job seekers", features: ["Unlimited resumes", "AI cover letters", "ATS scanner", "Interview coach", "Job tracker"], cta: "Start free trial", featured: true },
    { name: "Career OS", price: { m: 39, y: 29 }, tag: "The full ecosystem", features: ["Everything in Pro", "Analytics dashboard", "1:1 coach reviews", "Priority AI", "Salary insights"], cta: "Contact sales" },
  ];
  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={Rocket}>Pricing</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Simple, honest pricing.</h2></FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-8 inline-flex items-center gap-1 rounded-full glass p-1 text-xs">
              {(["m", "y"] as const).map((k) => {
                const active = (k === "y") === yearly;
                return (
                  <button key={k} onClick={() => setYearly(k === "y")} className={`relative rounded-full px-4 py-1.5 transition ${active ? "text-white" : "text-white/60"}`}>
                    {active && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#6366f1,#a855f7)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <span className="relative">{k === "m" ? "Monthly" : "Yearly · save 25%"}</span>
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl p-8 ${p.featured ? "glass-strong glow-blue" : "glass"}`}
            >
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(120deg,#6366f1,#a855f7)] px-3 py-1 text-[10px] uppercase tracking-widest text-white">Most popular</div>}
              <div className="text-sm text-white/60">{p.tag}</div>
              <div className="mt-2 font-display text-3xl text-white">{p.name}</div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-6xl text-white">${yearly ? p.price.y : p.price.m}</span>
                <span className="text-sm text-white/50">/mo</span>
              </div>
              <div className="mt-6 h-px w-full bg-white/10" />
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80"><Check className="h-4 w-4 text-cyan-300" />{f}</li>
                ))}
              </ul>
              <div className="mt-8"><MagneticButton href="#" variant={p.featured ? "primary" : "ghost"} className="w-full justify-center">{p.cta}<ArrowRight className="h-4 w-4" /></MagneticButton></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- 11. Testimonials --------------------------- */

const testimonials = [
  { name: "Maya Patel", role: "PM · Notion", quote: "I went from zero callbacks to four offers in six weeks. The ATS scanner alone is worth the price.", avatar: "MP" },
  { name: "Jordan Lee", role: "Engineer · Vercel", quote: "The interview coach is uncanny. It caught filler words I didn't even know I said.", avatar: "JL" },
  { name: "Sofia García", role: "Designer · Figma", quote: "The kanban tracker turned chaos into a system. Landed my dream role in a month.", avatar: "SG" },
  { name: "Ari Novak", role: "Founder", quote: "Cover letters that actually sound like me. I've never sent one I was embarrassed by.", avatar: "AN" },
  { name: "Priya Rao", role: "Data · Stripe", quote: "Career analytics helped me realize I was applying to the wrong roles. Pivoted instantly.", avatar: "PR" },
  { name: "Ben Cohen", role: "Marketer", quote: "Feels like Apple built a career app. Every interaction is delightful.", avatar: "BC" },
];

function Testimonials() {
  const track = [...testimonials, ...testimonials];
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={Star}>Loved by ambitious people</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">The results speak for themselves.</h2></FadeIn>
        </div>
      </div>
      <div className="relative mt-14 overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
        <div className="flex w-max animate-marquee gap-5 px-6">
          {track.map((t, i) => (
            <div key={i} className="w-[360px] shrink-0 rounded-2xl glass-strong p-6">
              <div className="text-sm leading-relaxed text-white/85">"{t.quote}"</div>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(120deg,#6366f1,#a855f7,#22d3ee)] text-xs font-semibold text-white">{t.avatar}</div>
                <div>
                  <div className="text-sm text-white">{t.name}</div>
                  <div className="text-xs text-white/50">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- 12. FAQ -------------------------------- */

const faqs = [
  { q: "How does CareerForge optimize my resume for ATS?", a: "We parse the target job, extract the semantic keywords ATS systems weight most, then rewrite your resume to match while keeping your voice intact." },
  { q: "Is my data private?", a: "Yes — encrypted at rest and in transit, and we never train models on your personal content." },
  { q: "Can I try it before paying?", a: "Absolutely. The Free plan gives you a full workflow with one resume and three AI cover letters." },
  { q: "Which industries does it support?", a: "Tech, design, product, marketing, finance, healthcare, and 40+ more — with role-specific templates for each." },
  { q: "Do you offer team plans?", a: "Yes. Career OS scales to bootcamps, universities, and outplacement teams. Contact sales." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <SectionEyebrow icon={Shield}>FAQ</SectionEyebrow>
          <FadeIn><h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Questions, answered.</h2></FadeIn>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-2xl glass px-5">
                <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between py-5 text-left">
                  <span className="text-base text-white">{f.q}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/70">{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
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
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[36px] glass-strong p-14 text-center">
          <div className="absolute -inset-16 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_65%)] blur-3xl" />
          <div className="relative">
            <SectionEyebrow icon={Zap}>Your next chapter</SectionEyebrow>
            <h2 className="mt-6 font-display text-5xl leading-tight tracking-tight text-white md:text-6xl">Forge your career. <span className="text-gradient italic">Today.</span></h2>
            <p className="mx-auto mt-4 max-w-lg text-white/70">Join 12,000+ ambitious people using CareerForge to land offers they love.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><MagneticButton href="#pricing">Start free trial<ArrowRight className="h-4 w-4" /></MagneticButton><MagneticButton href="#" variant="ghost">Book a demo</MagneticButton></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 pt-20 pb-10">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-lg bg-[linear-gradient(135deg,#22d3ee,#6366f1,#a855f7)]">
              <div className="absolute inset-[3px] rounded-md bg-background/60 grid place-items-center"><span className="font-display text-sm text-white">C</span></div>
            </div>
            <span className="text-base font-semibold">CareerForge</span>
          </div>
          <p className="mt-5 max-w-sm text-sm text-white/60">The AI career operating system. Built for people who refuse to settle.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-md items-center gap-2 rounded-full glass p-1.5 pl-4">
            <input placeholder="you@work.com" className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none" />
            <button className="rounded-full bg-[linear-gradient(120deg,#6366f1,#a855f7)] px-4 py-2 text-xs font-medium text-white">Subscribe</button>
          </form>
          <div className="mt-6 flex items-center gap-3 text-white/60">
            {[AtSign, Globe, Send, Play].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full glass transition hover:text-white"><I className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        <div className="grid gap-10 lg:col-span-7 md:grid-cols-4">
          {[
            { title: "Product", links: ["Resume Builder", "ATS Scanner", "Cover Letter", "Interview Coach"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
            { title: "Resources", links: ["Blog", "Guides", "Templates", "Changelog"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-widest text-white/50">{c.title}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map((l) => <li key={l}><a href="#" className="text-white/75 transition hover:text-white">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 pt-6 text-xs text-white/50">
        <div>© {new Date().getFullYear()} CareerForge Labs. All rights reserved.</div>
        <div className="flex items-center gap-1.5"><Target className="h-3 w-3" />Built for ambitious careers</div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-20 h-40 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-3xl" />
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
        <StickyATS />
        <ResumeBuilder />
        <ATSScanner />
        <CoverLetter />
        <InterviewCoach />
        <JobTracker />
        <Analytics />
        <Ecosystem />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
