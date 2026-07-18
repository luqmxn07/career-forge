"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Sparkles, ScanLine, Brain } from "lucide-react";

interface ScrollCanvasProps {
  frameCount: number;
  basePath: string;
  extension: string;
}

export default function ScrollCanvas({
  frameCount = 240,
  basePath = "/assets/scroll-animation/ezgif-frame-",
  extension = ".jpg",
}: ScrollCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Bind scroll progress of container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transform scroll position into a frame index (0 to frameCount - 1)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  // Handle preloading of all images
  useEffect(() => {
    let active = true;
    const preloadedImages: HTMLImageElement[] = [];
    let loadedCounter = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const formattedNum = String(i).padStart(3, "0");
      img.src = `${basePath}${formattedNum}${extension}`;

      img.onload = () => {
        if (!active) return;
        loadedCounter++;
        setLoadedCount(loadedCounter);
        if (loadedCounter === frameCount) {
          setIsPreloaded(true);
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${formattedNum}`);
        if (!active) return;
        // Still count it so we don't block the loader forever
        loadedCounter++;
        setLoadedCount(loadedCounter);
        if (loadedCounter === frameCount) {
          setIsPreloaded(true);
        }
      };

      preloadedImages.push(img);
    }

    imagesRef.current = preloadedImages;

    return () => {
      active = false;
    };
  }, [frameCount, basePath, extension]);

  // Resizing logic for responsive aspect-contain canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Image original dimensions
    const imgWidth = img.naturalWidth || img.width || 1920;
    const imgHeight = img.naturalHeight || img.height || 1080;

    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = imgWidth / imgHeight;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image aspect ratio (fit height)
      drawWidth = canvas.height * imgAspect;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      // Canvas is taller than image aspect ratio (fit width)
      drawHeight = canvas.width / imgAspect;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, offsetX, offsetY, drawWidth, drawHeight);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Apply backing store resolution (scaled by dpr)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Redraw current frame
    const currentProgress = scrollYProgress.get();
    const currentIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.round(currentProgress * (frameCount - 1)))
    );
    drawFrame(currentIndex);
  };

  // Resize listener
  useEffect(() => {
    if (!isPreloaded) return;

    // Initial resize and draw
    handleResize();

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isPreloaded]);

  // Update canvas frame as scroll happens
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isPreloaded) return;
    const roundedIndex = Math.min(frameCount - 1, Math.max(0, Math.round(latest)));
    drawFrame(roundedIndex);
  });

  // Calculate opacity transformations for storytelling text blocks
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.25, 0.3], [0, 1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.32, 0.38, 0.58, 0.64], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.68, 0.74, 0.95, 1.0], [0, 1, 1, 0.8]);

  // Text container animation
  const textX1 = useTransform(scrollYProgress, [0, 0.05, 0.25, 0.3], [30, 0, 0, -30]);
  const textX2 = useTransform(scrollYProgress, [0.32, 0.38, 0.58, 0.64], [30, 0, 0, -30]);
  const textX3 = useTransform(scrollYProgress, [0.68, 0.74, 0.95, 1.0], [30, 0, 0, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ height: "300vh" }} // Tall container provides the scrolling distance
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Sleek Loader Overlay */}
        {!isPreloaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20">
            <div className="relative h-16 w-16 mb-4">
              <div className="absolute inset-0 rounded-full border border-white/5" />
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">
              Forging Canvas Assets
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-400">
              {Math.round((loadedCount / frameCount) * 100)}%
            </div>
          </div>
        )}

        {/* The HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-full max-h-full object-contain pointer-events-none"
        />

        {/* Text Storytelling Overlays */}
        {isPreloaded && (
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_40%,transparent_70%)] flex items-center px-6 md:px-16 lg:px-24">
            <div className="relative w-full max-w-lg md:max-w-xl">
              
              {/* Step 1 Overlay */}
              <motion.div
                style={{ opacity: opacity1, x: textX1 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col justify-center text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-4 w-fit">
                  <Sparkles className="h-3.5 w-3.5" /> 01 · Ingest
                </div>
                <h3 className="font-display text-4xl font-semibold text-white tracking-tight leading-none md:text-5xl">
                  Holographic Neural Parser
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  Initialize secure resume document ingestion. Our parser breaks down raw details from any CV layout and maps structure automatically in a virtual sandbox environment.
                </p>
              </motion.div>

              {/* Step 2 Overlay */}
              <motion.div
                style={{ opacity: opacity2, x: textX2 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col justify-center text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-purple-400 mb-4 w-fit">
                  <ScanLine className="h-3.5 w-3.5" /> 02 · Analysis
                </div>
                <h3 className="font-display text-4xl font-semibold text-white tracking-tight leading-none md:text-5xl">
                  Semantic ATS Matching
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  Match keywords and verify readability. The ATS Scanner evaluates compliance indexes, parsing verb structures, and density mapping against target roles in seconds.
                </p>
              </motion.div>

              {/* Step 3 Overlay */}
              <motion.div
                style={{ opacity: opacity3, x: textX3 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col justify-center text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-4 w-fit">
                  <Brain className="h-3.5 w-3.5" /> 03 · Optimization
                </div>
                <h3 className="font-display text-4xl font-semibold text-white tracking-tight leading-none md:text-5xl">
                  The Career Monolith
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  Complete optimization loop. Review your finalized CV document, export PDF formats directly, and lock sync parameters to tanstack analytics boards.
                </p>
              </motion.div>

            </div>
          </div>
        )}

        {/* Subtle Dark Bottom Vignette to transition smoothly into the next section */}
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
