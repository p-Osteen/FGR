import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // ms
const LOAD_TIMEOUT = 8000; // ms — if image hasn't loaded in 8s, give up

export default function OptimizedImage({ src, alt, className = '', ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef(null);
  const retryTimerRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(retryTimerRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  // Reset state when src changes
  useEffect(() => {
    clearTimers();
    setIsLoaded(false);
    setIsFailed(false);
    setRetryCount(0);
    return clearTimers;
  }, [src, clearTimers]);

  // Start a load timeout whenever the src or retryCount changes
  useEffect(() => {
    if (isLoaded || isFailed || !src) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Image hasn't loaded in time — treat as failed
      if (!isLoaded) {
        setIsFailed(true);
      }
    }, LOAD_TIMEOUT);

    return () => clearTimeout(timeoutRef.current);
  }, [src, retryCount, isLoaded, isFailed]);

  // Check if image is already cached/complete on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      clearTimers();
      setIsLoaded(true);
    }
  }, [src, retryCount, clearTimers]);

  const handleLoad = useCallback(() => {
    clearTimers();
    setIsLoaded(true);
  }, [clearTimers]);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      retryTimerRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY + Math.random() * 500);
    } else {
      clearTimers();
      setIsFailed(true);
    }
  }, [retryCount, clearTimers]);

  // Build the src — append a cache-buster on retries to force a new connection
  const finalSrc = isFailed || !src
    ? PLACEHOLDER
    : retryCount > 0
      ? `${src}${src.includes('?') ? '&' : '?'}_r=${retryCount}`
      : src;

  return (
    <div className={`optimized-image-wrapper ${className}`}>
      {!isLoaded && !isFailed && <div className="optimized-image-shimmer" />}
      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        className={`optimized-image ${isLoaded || isFailed ? 'optimized-image--loaded' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}


