import { useState, useEffect } from "react";

export function useImageSequence(basePath: string, extension: string, frameCount: number) {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    const onLoad = () => {
      if (!active) return;
      loaded++;
      setLoadedCount(loaded);
      if (loaded === frameCount) {
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const formattedNum = String(i).padStart(3, "0");

      img.onload = onLoad;
      img.onerror = () => {
        console.warn(`Failed to load image frame: ${basePath}${formattedNum}${extension}`);
        onLoad(); // Count error as loaded to prevent loading screen hang
      };

      img.src = `${basePath}${formattedNum}${extension}`;

      // Trigger lazy GPU decoding if supported
      if (typeof img.decode === "function") {
        img
          .decode()
          .then(() => {
            // Already handled by onload, but decode ensures it is decompressed in GPU memory
          })
          .catch(() => {
            // Ignore decode failures, onload fallback will handle it
          });
      }

      loadedImages.push(img);
    }

    setImages(loadedImages);

    return () => {
      active = false;
      loadedImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [basePath, extension, frameCount]);

  return {
    images,
    isLoaded,
    progress: frameCount ? loadedCount / frameCount : 0,
    loadedCount,
    totalCount: frameCount,
  };
}
