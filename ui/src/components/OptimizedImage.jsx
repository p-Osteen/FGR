import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

/**
 * OptimizedImage — shows a smooth shimmer placeholder, then fades in the real
 * image once loaded. Uses an IntersectionObserver to manage a timeout fallback.
 */
const OptimizedImage = React.memo(function OptimizedImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  priority = false,
  style,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef(null);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  // 1. Intersection Observer to trigger loading
  useEffect(() => {
    if (priority || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' } // Preload when 400px away from viewport
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [priority, inView]);

  // 2. Check if image is already cached/complete on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) {
        setLoaded(true);
      } else if (img.naturalWidth === 0 && img.src && !img.src.includes('placeholder.svg')) {
        // Cached but broken
        setError(true);
        setLoaded(true);
      }
    }
  }, [src, inView]);

  // 3. Timeout fallback: if image hasn't loaded after 8s OF BEING IN VIEW, show placeholder
  useEffect(() => {
    if (!inView || loaded || error) return;

    timeoutRef.current = setTimeout(() => {
      if (!loaded) {
        setError(true);
        setLoaded(true);
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src, inView, loaded, error]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Only render the real src if it's in view and hasn't errored
  const imgSrc = error ? PLACEHOLDER : (inView ? (src || PLACEHOLDER) : undefined);

  return (
    <div
      ref={wrapperRef}
      className={`optimized-image-wrapper ${wrapperClassName}`}
      style={style}
    >
      {/* Smooth shimmer placeholder shown until image loads */}
      {!loaded && <div className="optimized-image-shimmer" />}

      {inView && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          className={`optimized-image ${className} ${loaded ? 'optimized-image--loaded' : ''}`}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
});

export default OptimizedImage;
