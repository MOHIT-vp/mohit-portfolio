export const mq = (q: string) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null);

export const reducedMotion = () => !!mq('(prefers-reduced-motion: reduce)')?.matches;
export const reducedTransparency = () => !!mq('(prefers-reduced-transparency: reduce)')?.matches;
export const finePointer = () => !!mq('(hover: hover) and (pointer: fine)')?.matches;
