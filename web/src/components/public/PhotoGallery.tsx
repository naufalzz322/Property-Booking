"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  Pause,
  Play,
  Image as ImageIcon,
} from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  unitNumber: string;
  className?: string;
}

export function PhotoGallery({ photos, unitNumber, className }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const displayPhotos = photos.length > 0 ? photos : [];
  const hasMultiple = displayPhotos.length > 1;

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying && hasMultiple && !isFullscreen) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, hasMultiple, displayPhotos.length, isFullscreen]);

  // Image loading - track per image
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
    // Only set loading to false when the current image finishes loading
    if (index === currentIndex) {
      setIsLoading(false);
    }
  }, [currentIndex]);

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
    setIsLoading(true);
  }, [displayPhotos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  }, [displayPhotos.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
    // Scroll thumbnail into view
    if (thumbnailRef.current) {
      const thumb = thumbnailRef.current.children[index] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, []);

  // Touch handlers for swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && hasMultiple) goToNext();
    if (isRightSwipe && hasMultiple) goToPrevious();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, goToPrevious, goToNext]);

  // Body scroll lock
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      setShowControls(true);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const resetControls = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", resetControls);
    return () => {
      window.removeEventListener("mousemove", resetControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  // Empty state
  if (displayPhotos.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-stone-400" />
            <p className="mt-2 text-sm text-stone-500">Kamar {unitNumber}</p>
            <p className="text-xs text-stone-400">Belum ada foto</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Main Image */}
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 group"
          onTouchStart={hasMultiple ? onTouchStart : undefined}
          onTouchMove={hasMultiple ? onTouchMove : undefined}
          onTouchEnd={hasMultiple ? onTouchEnd : undefined}
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayPhotos[currentIndex]}
            alt={`${unitNumber} - Foto ${currentIndex + 1}`}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isLoading ? "opacity-0" : "opacity-100",
              isZoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"
            )}
            onClick={() => !isFullscreen && setIsZoomed(!isZoomed)}
            onLoad={() => handleImageLoad(currentIndex)}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:shadow-xl"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5 text-stone-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:shadow-xl"
                aria-label="Foto selanjutnya"
              >
                <ChevronRight className="w-5 h-5 text-stone-700" />
              </button>
            </>
          )}

          {/* Top actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Auto-play button */}
            {hasMultiple && !isFullscreen && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsAutoPlaying(!isAutoPlaying); }}
                className="w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                aria-label={isAutoPlaying ? "Jeda slideshow" : "Mulai slideshow"}
              >
                {isAutoPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>
            )}
            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
              aria-label="Lihat foto besar"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Counter badge */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-2">
              <span>{currentIndex + 1}</span>
              <span className="text-white/50">/</span>
              <span>{displayPhotos.length}</span>
            </div>
          )}

          {/* Progress dots for slideshow */}
          {hasMultiple && isAutoPlaying && !isFullscreen && (
            <div className="absolute bottom-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>

        {/* Thumbnails strip */}
        {hasMultiple && (
          <div
            ref={thumbnailRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayPhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all duration-200",
                  index === currentIndex
                    ? "ring-2 ring-amber-500 ring-offset-2 scale-105 shadow-md"
                    : "opacity-60 hover:opacity-100 hover:scale-102"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-amber-500/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Controls overlay */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors pointer-events-auto"
              aria-label="Tutup"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">
              {currentIndex + 1} / {displayPhotos.length}
            </div>

            {/* Navigation */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors pointer-events-auto"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors pointer-events-auto"
                  aria-label="Foto selanjutnya"
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            <div
              className="absolute bottom-4 left-4 right-4 flex justify-center"
              style={{ maxWidth: "100%" }}
            >
              <div
                className="flex gap-2 overflow-x-auto justify-center pb-1 scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  maxWidth: "calc(100vw - 2rem)",
                }}
              >
                {displayPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200",
                      index === currentIndex
                        ? "ring-2 ring-white scale-110 shadow-lg"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="absolute bottom-20 left-4 text-white/40 text-sm hidden lg:block">
              ← → untuk navigasi • ESC untuk tutup
            </div>
          </div>

          {/* Main image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[80vh] mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhotos[currentIndex]}
              alt={`${unitNumber} - Foto ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </>
  );
}
