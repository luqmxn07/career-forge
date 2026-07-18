import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useImageSequence } from "./useImageSequence";
import { useScrollFrames } from "./useScrollFrames";
import { BASE_PATH, EXTENSION, FRAME_COUNT, SCROLL_HEIGHT_VH } from "./constants";

export default function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { images, isLoaded, progress, loadedCount } = useImageSequence(
    BASE_PATH,
    EXTENSION,
    FRAME_COUNT,
  );

  const navRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Logic to calculate opacity and sliding offset (y translation) for narratives
  const getOpacityAndY = (
    currentProgress: number,
    start: number,
    peakStart: number,
    peakEnd: number,
    end: number,
  ) => {
    if (currentProgress < start || currentProgress > end) {
      return { opacity: 0, y: 30 };
    }
    if (currentProgress >= peakStart && currentProgress <= peakEnd) {
      return { opacity: 1, y: 0 };
    }
    if (currentProgress >= start && currentProgress < peakStart) {
      const p = (currentProgress - start) / (peakStart - start);
      return { opacity: p, y: 30 * (1 - p) };
    }
    // currentProgress > peakEnd && currentProgress <= end
    const p = (end - currentProgress) / (end - peakEnd);
    return { opacity: p, y: -30 * (1 - p) };
  };

  const handleProgress = (currentProgress: number) => {
    // 4 narratives spaced across the 0.0 - 1.0 scroll range
    const n1 = getOpacityAndY(currentProgress, 0.0, 0.0, 0.12, 0.22);
    const n2 = getOpacityAndY(currentProgress, 0.22, 0.32, 0.45, 0.55);
    const n3 = getOpacityAndY(currentProgress, 0.55, 0.65, 0.75, 0.85);
    const n4 = getOpacityAndY(currentProgress, 0.85, 0.92, 1.0, 1.0);

    const values = [n1, n2, n3, n4];
    navRefs.forEach((ref, index) => {
      const el = ref.current;
      if (el) {
        const val = values[index];
        el.style.opacity = String(val.opacity);
        el.style.transform = `translateY(${val.y}px)`;
        // Disable pointer interactions for invisible narrative cards to prevent blockages
        el.style.pointerEvents = val.opacity > 0.1 ? "auto" : "none";
      }
    });
  };

  useScrollFrames({
    canvasRef,
    containerRef,
    images,
    isLoaded,
    onProgress: handleProgress,
  });

  // Calculate loading text message based on progress
  let statusMessage = "Initializing systems...";
  const pct = Math.round(progress * 100);
  if (pct > 90) statusMessage = "Calibrating workspace tools...";
  else if (pct > 60) statusMessage = "Preheating ATS keyword gateway...";
  else if (pct > 30) statusMessage = "Compiling cinematic scanner models...";

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060709] px-6 text-center select-none"
          >
            {/* Ambient backdrop glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[40%] -left-[30%] h-[80%] w-[80%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
              <div
                className="absolute -bottom-[40%] -right-[30%] h-[80%] w-[80%] rounded-full bg-emerald/5 blur-[120px] animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <div className="relative flex flex-col items-center max-w-sm w-full z-10">
              {/* Premium Pulsing Logo container */}
              <div className="relative mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-primary to-primary-glow shadow-[0_0_40px_hsl(212_100%_60%/0.3)] animate-pulse">
                <Sparkles
                  className="h-8 w-8 text-primary-foreground animate-spin"
                  style={{ animationDuration: "8s" }}
                />
              </div>

              {/* Progress Text */}
              <h2 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
                FORGING RESUME ENGINE
              </h2>
              <p className="text-xs text-muted-foreground font-mono h-6 transition-all duration-300">
                {statusMessage}
              </p>

              {/* Smooth Loader Bar */}
              <div className="mt-8 w-full h-1 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
                <div
                  className="h-full bg-linear-to-r from-primary via-primary-glow to-emerald shadow-[0_0_12px_hsl(212_100%_60%/0.8)] transition-all duration-100 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Counter status */}
              <div className="mt-3 text-xs font-mono text-muted-foreground flex items-center justify-between w-full">
                <span>
                  {loadedCount} / {FRAME_COUNT} FRAMES
                </span>
                <span className="text-primary font-semibold">{pct}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main sticky scroll boundaries container */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#060709]">
          {/* Subtle design glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-[10%] right-[20%] h-[500px] w-[500px] rounded-full bg-emerald/3 blur-[120px]" />
          </div>

          {/* HTML5 Canvas element */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pointer-events-none relative z-10"
          />

          {/* Narrative Text Overlays */}
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
            {/* Narrative Section 1 */}
            <div
              ref={navRefs[0]}
              className="absolute max-w-3xl text-center flex flex-col items-center justify-center select-none"
              style={{ opacity: 0, transform: "translateY(30px)", pointerEvents: "none" }}
            >
              <h1 className="font-display text-4xl font-semibold leading-[1.1] md:text-6xl tracking-tight text-white">
                Land the role with resumes <br />
                <span className="text-gradient">forged by AI</span>.
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                CareerForge builds ATS-ready resumes, scores them against real job descriptions,
                drafts cover letters, and rehearses the interview — all inside one focused, dark
                workspace.
              </p>
              <div className="mt-8">
                <span className="text-xs text-muted-foreground/60 animate-pulse font-mono tracking-wider">
                  SCROLL TO INITIATE SCANNER
                </span>
              </div>
            </div>

            {/* Narrative Section 2 */}
            <div
              ref={navRefs[1]}
              className="absolute max-w-3xl text-center flex flex-col items-center justify-center select-none"
              style={{ opacity: 0, transform: "translateY(30px)", pointerEvents: "none" }}
            >
              <h2 className="font-display text-4xl font-semibold leading-[1.1] md:text-6xl tracking-tight text-white">
                Instant <span className="text-gradient">ATS Scanning</span>
              </h2>
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                Match your resume directly against specific job details. Our engine validates resume
                alignment and shows exact missing elements instantly.
              </p>
            </div>

            {/* Narrative Section 3 */}
            <div
              ref={navRefs[2]}
              className="absolute max-w-3xl text-center flex flex-col items-center justify-center select-none"
              style={{ opacity: 0, transform: "translateY(30px)", pointerEvents: "none" }}
            >
              <h2 className="font-display text-4xl font-semibold leading-[1.1] md:text-6xl tracking-tight text-white">
                Deep Semantic <span className="text-gradient">Refining</span>
              </h2>
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                Get context-aware phrasing enhancements and keyword density suggestions customized
                to pass automated review processes.
              </p>
            </div>

            {/* Narrative Section 4 */}
            <div
              ref={navRefs[3]}
              className="absolute max-w-3xl text-center flex flex-col items-center justify-center select-none"
              style={{ opacity: 0, transform: "translateY(30px)", pointerEvents: "none" }}
            >
              <h2 className="font-display text-4xl font-semibold leading-[1.1] md:text-6xl tracking-tight text-white">
                Forge Your Career <br />
                <span className="text-gradient">Workspace</span>
              </h2>
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                Stop tweaking templates. Start compiling high-impact resumes, drafting cover
                letters, and mocking interviews in a premium, integrated toolkit.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/auth/signup"
                  className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold pointer-events-auto"
                >
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-md border border-glass-border bg-white/[0.03] px-6 py-3 text-sm hover:bg-white/[0.06] pointer-events-auto"
                >
                  Live demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
