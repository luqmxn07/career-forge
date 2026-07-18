import { useEffect, useRef, RefObject } from "react";

interface UseScrollFramesProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  images: HTMLImageElement[];
  isLoaded: boolean;
  onProgress?: (progress: number) => void;
}

export function useScrollFrames({
  canvasRef,
  containerRef,
  images,
  isLoaded,
  onProgress,
}: UseScrollFramesProps) {
  const lastFrameIndexRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const onProgressRef = useRef(onProgress);

  // Keep progress callback updated without refiring the main effect
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img) return;

      // Handle Retina/High-DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Only resize canvas buffer if size or resolution changes to avoid drawing lags
      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas viewport -> scale by width and center vertically
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        // Image is taller than canvas viewport -> scale by height and center horizontally
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Draw initial frame immediately
    drawFrame(0);
    lastFrameIndexRef.current = 0;
    if (onProgressRef.current) {
      onProgressRef.current(0);
    }

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollTop = -rect.top;
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollTop / totalScrollable));
      const frameIndex = Math.min(images.length - 1, Math.floor(progress * images.length));

      // Call the progress handler immediately on scroll
      if (onProgressRef.current) {
        onProgressRef.current(progress);
      }

      if (frameIndex !== lastFrameIndexRef.current) {
        lastFrameIndexRef.current = frameIndex;

        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }

        animationFrameIdRef.current = requestAnimationFrame(() => {
          drawFrame(frameIndex);
        });
      }
    };

    const handleResize = () => {
      if (lastFrameIndexRef.current >= 0) {
        drawFrame(lastFrameIndexRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Run once on mount to capture starting position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [canvasRef, containerRef, images, isLoaded]);
}
