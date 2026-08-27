import React, { useState, useRef, useEffect } from 'react';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

export function getProxyUrl(url, width = null) {
  if (!url || !url.startsWith('http')) return url;
  let proxy = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
  if (width) proxy += `&w=${width}`;
  return proxy;
}

export default function OptimizedImage({ src, alt, className = '', proxyWidth = 0, ...props }) {
  const [stage, setStage] = useState(0); // 0: Proxy, 1: Direct, 2: Placeholder
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setStage(0);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src, stage]);

  const getStageSrc = () => {
    if (!src) return PLACEHOLDER;
    const isExternal = src.startsWith('http');
    
    if (stage === 0) {
      return isExternal ? getProxyUrl(src, proxyWidth) : src;
    }
    if (stage === 1) {
      return src;
    }
    return PLACEHOLDER;
  };

  const handleError = () => {
    if (stage < 2) {
      setStage(prev => prev + 1);
    } else {
      setIsLoaded(true); // Treat placeholder as loaded
    }
  };

  const finalSrc = getStageSrc();

  return (
    <div className={`optimized-image-wrapper ${className}`}>
      {!isLoaded && stage < 2 && <div className="optimized-image-shimmer" />}
      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        className={`optimized-image ${isLoaded || stage === 2 ? 'optimized-image--loaded' : ''}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}
