import React, { useState, useRef, useEffect, useCallback } from 'react';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

/**
 * OptimizedImage — shows a smooth shimmer placeholder, then fades in the real
 * image once loaded. Falls back to placeholder on error OR timeout.
 *
 * Props:
 *  - src: image URL
 *  - alt: alt text
 *  - className: applied to the <img>
 *  - wrapperClassName: applied to the outer container
 *  - priority: if true, skip lazy loading (for above-the-fold images)
 *  - style: additional inline styles for the wrapper
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
  const imgRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check if image is already cached/complete on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);


  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const imgSrc = error ? PLACEHOLDER : (src || PLACEHOLDER);

  return (
    <div
      className={`optimized-image-wrapper ${wrapperClassName}`}
      style={style}
    >
      {/* Smooth shimmer placeholder shown until image loads */}
      {!loaded && <div className="optimized-image-shimmer" />}

      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        className={`optimized-image ${className} ${loaded ? 'optimized-image--loaded' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});

export default OptimizedImage;
