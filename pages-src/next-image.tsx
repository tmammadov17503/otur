import type { CSSProperties, ImgHTMLAttributes } from 'react';

type StaticImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
};

export default function StaticImage({ alt, fill = false, priority = false, style, ...props }: StaticImageProps) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style;

  return (
    // oxlint-disable-next-line next/no-img-element -- GitHub Pages uses this small compatibility component without a Next.js server.
    <img
      {...props}
      alt={alt}
      decoding="async"
      loading={priority ? 'eager' : (props.loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : props.fetchPriority}
      style={fillStyle}
    />
  );
}
