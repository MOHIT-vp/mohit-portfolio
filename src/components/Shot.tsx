import { useState } from 'react';

type Props = { src: string; alt: string; className?: string; sizes?: string; eager?: boolean; height?: number };

/**
 * A real screenshot from a project's repository, served at two widths.
 * If the file fails to load, the frame collapses to its alt text instead of a broken image.
 */
export function Shot({ src, alt, className = '', sizes = '100vw', eager, height = 877 }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`shot ${className}`}>
      {failed ? (
        <p className="shot__fallback">{alt}</p>
      ) : (
        <img
          src={`/work/${src}-1600.webp`}
          srcSet={`/work/${src}-800.webp 800w, /work/${src}-1600.webp 1600w`}
          sizes={sizes}
          alt={alt}
          width={1600}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
