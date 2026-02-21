import React from 'react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Whether to lazy-load the image. Defaults to true (below-fold). Set false for above-fold images. */
  lazy?: boolean;
  /** Responsive sizes hint for the browser */
  sizes?: string;
  /** Aspect ratio for the container to prevent CLS (e.g. "16/9", "4/3") */
  aspectRatio?: string;
}

export default function OptimizedImage({
  lazy = true,
  sizes,
  aspectRatio,
  className = '',
  style,
  alt = '',
  ...rest
}: OptimizedImageProps) {
  const containerStyle: React.CSSProperties | undefined = aspectRatio
    ? { aspectRatio, ...style }
    : style;

  return (
    <img
      loading={lazy ? 'lazy' : 'eager'}
      decoding={lazy ? 'async' : 'auto'}
      sizes={sizes}
      alt={alt}
      className={className}
      style={containerStyle}
      {...rest}
    />
  );
}
