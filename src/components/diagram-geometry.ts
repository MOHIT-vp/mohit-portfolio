import type { GNode } from '../content/graphs';

/** Label offset for a diagram node, in viewBox units, given the gap from the node. */
export function labelGeometry(node: GNode, gap: number) {
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  let dx = 0;
  let dy = 0;
  switch (node.place) {
    case 't': dy = -gap; break;
    case 'b': dy = gap * 1.7; break;
    case 'l': dx = -gap; anchor = 'end'; dy = gap * 0.35; break;
    case 'r': dx = gap; anchor = 'start'; dy = gap * 0.35; break;
  }
  if (anchor === 'middle' && node.x > 0.86) { anchor = 'end'; dx = gap * 0.6; }
  if (anchor === 'middle' && node.x < 0.14) { anchor = 'start'; dx = -gap * 0.6; }
  return { dx, dy, anchor };
}
