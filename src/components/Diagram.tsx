import { layouts, type GLayout } from '../content/graphs';
import { labelGeometry } from './diagram-geometry';

type Props = {
  /** Layout key from graphs.ts. */
  layout: string;
  caption?: string;
  className?: string;
  /** Hide the visible caption; the figure keeps an accessible name. */
  quiet?: boolean;
};

const W = 1000;

/**
 * A static SVG diagram drawn from graphs.ts, with a text equivalent:
 * on small screens the drawing gives way to a stepped list of its nodes.
 */
export function Diagram({ layout: key, caption, className = '', quiet }: Props) {
  const layout = layouts[key];
  if (!layout) return null;
  return (
    <figure className={`diagram ${className}`}>
      <div
        className="diagram__box"
        style={{ aspectRatio: String(layout.aspect) }}
      >
        <DiagramSvg layout={layout} />
      </div>
      <ol className="diagram__steps" aria-label={layout.title}>
        {ranks(layout).map((row, i) => (
          <li key={i}>
            {row.map((node) => (
              <span key={node.id} className={`pill pill--${node.kind}`}>
                {node.label || '·'}
              </span>
            ))}
          </li>
        ))}
      </ol>
      <figcaption className={quiet ? 'sr-only' : 'diagram__caption'}>{caption ?? layout.title}</figcaption>
    </figure>
  );
}

function ranks(layout: GLayout) {
  const rows = new Map<number, GLayout['nodes']>();
  for (const node of layout.nodes) {
    if (!node.label) continue;
    rows.set(node.rank, [...(rows.get(node.rank) ?? []), node]);
  }
  return [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, row]) => row);
}

function DiagramSvg({ layout }: { layout: GLayout }) {
  const H = W / layout.aspect;
  const pos = new Map(layout.nodes.map((n) => [n.id, { x: n.x * W, y: n.y * H }]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram__svg" aria-hidden="true" focusable="false">
      {layout.edges.map((e) => {
        const a = pos.get(e.from)!;
        const b = pos.get(e.to)!;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="diagram__edge" />
            {e.label && (
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 10} textAnchor="middle" className="diagram__edge-label">
                {e.label}
              </text>
            )}
          </g>
        );
      })}
      {layout.nodes.map((node) => {
        const p = pos.get(node.id)!;
        const g = labelGeometry(node, 24);
        return (
          <g key={node.id}>
            <circle cx={p.x} cy={p.y} r={11} className={`diagram__node k-${node.kind}`} />
            <circle cx={p.x} cy={p.y} r={19} className={`diagram__ring k-${node.kind}`} />
            {node.label && (
              <text x={p.x + g.dx} y={p.y + g.dy} textAnchor={g.anchor} className="diagram__label">
                {node.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
