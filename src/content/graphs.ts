/**
 * Diagram layouts for the case studies, drawn as static SVG with a text equivalent.
 *
 * Coordinates are normalised to the diagram box (0..1). Structure comes from
 * the projects' source code:
 *  - helix-0: NODE_TYPES and FORWARD_EDGES in HELIX-X src/model.py (self-relations omitted)
 *  - helix-2: HybridDecoder (DistMult, TransE, dot -> Linear 3->16->1) in src/model.py
 *  - helix-3: the longest canonical metapath and a short one in src/explainer.py
 *  - refund:  backend/agents, backend/core/stopping_rules.py and supervisor.py
 */

export type Kind = 'a' | 'b' | 'c' | 'd' | 'm';
export type Place = 't' | 'b' | 'l' | 'r';
export type GNode = { id: string; label: string; kind: Kind; x: number; y: number; rank: number; place: Place };
export type GEdge = { from: string; to: string; label?: string };
export type GLayout = { id: string; aspect: number; title: string; nodes: GNode[]; edges: GEdge[] };

const n = (id: string, label: string, kind: Kind, x: number, y: number, rank: number, place: Place = 'b'): GNode => ({ id, label, kind, x, y, rank, place });

export const layouts: Record<string, GLayout> = {
  'helix-0': {
    id: 'helix-0',
    aspect: 1.5,
    title: 'The 11 node types in the HELIX-X graph and the relations between them',
    nodes: [
      n('pc', 'Pharmacologic class', 'm', 0.1, 0.1, 0, 'r'),
      n('cp', 'Compound', 'a', 0.26, 0.34, 1, 't'),
      n('se', 'Side effect', 'm', 0.07, 0.56, 1, 'r'),
      n('ge', 'Gene', 'b', 0.52, 0.52, 2, 't'),
      n('di', 'Disease', 'd', 0.79, 0.3, 3, 't'),
      n('sy', 'Symptom', 'm', 0.93, 0.1, 4, 'l'),
      n('an', 'Anatomy', 'm', 0.92, 0.6, 4, 'l'),
      n('pw', 'Pathway', 'c', 0.7, 0.86, 3, 'b'),
      n('bp', 'Biological process', 'm', 0.44, 0.9, 3, 'b'),
      n('cc', 'Cellular component', 'm', 0.14, 0.84, 3, 'b'),
      n('mf', 'Molecular function', 'm', 0.93, 0.92, 3, 'l'),
    ],
    edges: [
      { from: 'pc', to: 'cp', label: 'includes' },
      { from: 'cp', to: 'ge', label: 'binds' },
      { from: 'cp', to: 'se', label: 'causes' },
      { from: 'cp', to: 'di', label: 'treats' },
      { from: 'di', to: 'ge', label: 'associates' },
      { from: 'di', to: 'an', label: 'localizes' },
      { from: 'di', to: 'sy', label: 'presents' },
      { from: 'an', to: 'ge', label: 'expresses' },
      { from: 'ge', to: 'pw', label: 'participates' },
      { from: 'ge', to: 'bp' },
      { from: 'ge', to: 'cc' },
      { from: 'ge', to: 'mf' },
    ],
  },
  'helix-2': {
    id: 'helix-2',
    aspect: 1.6,
    title: 'Hybrid decoder: DistMult, TransE and dot-product scores combined by a 3 to 16 to 1 network',
    nodes: [
      n('ce', 'Compound', 'a', 0.07, 0.28, 0, 't'),
      n('de', 'Disease', 'd', 0.07, 0.72, 0, 'b'),
      n('dm', 'DistMult', 'b', 0.42, 0.16, 1, 't'),
      n('te', 'TransE', 'b', 0.42, 0.5, 1, 't'),
      n('dp', 'Dot product', 'b', 0.42, 0.84, 1, 'b'),
      n('mlp', '3 → 16 → 1', 'c', 0.7, 0.5, 2, 't'),
      n('sc', 'Score', 'a', 0.94, 0.5, 3, 't'),
    ],
    edges: [
      { from: 'ce', to: 'dm' }, { from: 'ce', to: 'te' }, { from: 'ce', to: 'dp' },
      { from: 'de', to: 'dm' }, { from: 'de', to: 'te' }, { from: 'de', to: 'dp' },
      { from: 'dm', to: 'mlp' }, { from: 'te', to: 'mlp' }, { from: 'dp', to: 'mlp' },
      { from: 'mlp', to: 'sc' },
    ],
  },
  'helix-3': {
    id: 'helix-3',
    aspect: 1.8,
    title: 'Evidence: two canonical metapaths from a compound to a disease',
    nodes: [
      n('c', 'Compound', 'a', 0.05, 0.5, 0, 'b'),
      n('g1', 'Gene', 'b', 0.27, 0.26, 1, 't'),
      n('pw', 'Pathway', 'c', 0.5, 0.26, 2, 't'),
      n('g2', 'Gene', 'b', 0.73, 0.26, 3, 't'),
      n('g3', 'Gene', 'b', 0.5, 0.8, 2, 'b'),
      n('d', 'Disease', 'd', 0.95, 0.5, 4, 'b'),
    ],
    edges: [
      { from: 'c', to: 'g1', label: 'binds' },
      { from: 'g1', to: 'pw', label: 'participates' },
      { from: 'pw', to: 'g2', label: 'participates' },
      { from: 'g2', to: 'd', label: 'associates' },
      { from: 'c', to: 'g3', label: 'binds' },
      { from: 'g3', to: 'd', label: 'associates' },
    ],
  },
  refund: {
    id: 'refund',
    aspect: 1.7,
    title: 'Refund routing: three agents advise, stopping rules run first, a supervisor routes or escalates, and every decision is audited',
    nodes: [
      n('ev', 'Refund', 'm', 0.05, 0.5, 0, 'b'),
      n('mdr', 'MDR cost', 'b', 0.28, 0.16, 1, 't'),
      n('rr', 'Retention risk', 'b', 0.28, 0.5, 1, 't'),
      n('lq', 'Liquidity', 'b', 0.28, 0.84, 1, 'b'),
      n('sr', 'Stopping rules', 'd', 0.53, 0.5, 2, 't'),
      n('sv', 'Supervisor', 'a', 0.74, 0.5, 3, 't'),
      n('au', 'Audit trail', 'm', 0.74, 0.88, 4, 'b'),
      n('upi', 'UPI credit', 'c', 0.95, 0.16, 4, 't'),
      n('card', 'Card reversal', 'c', 0.95, 0.5, 4, 't'),
      n('hr', 'Human review', 'd', 0.95, 0.84, 4, 'b'),
    ],
    edges: [
      { from: 'ev', to: 'mdr' }, { from: 'ev', to: 'rr' }, { from: 'ev', to: 'lq' },
      { from: 'mdr', to: 'sr' }, { from: 'rr', to: 'sr' }, { from: 'lq', to: 'sr' },
      { from: 'sr', to: 'sv' },
      { from: 'sr', to: 'hr', label: 'escalate' },
      { from: 'sv', to: 'upi' }, { from: 'sv', to: 'card' }, { from: 'sv', to: 'hr' },
      { from: 'sv', to: 'au' },
    ],
  },
};

/** Tools that surface as labels in the dive scene when the pointer comes near. */
export const heroLabels = [
  'React', 'TypeScript', 'Python', 'FastAPI', 'PyTorch', 'PostgreSQL', 'Node.js', 'Next.js',
  'Docker', 'LangGraph', 'Prisma', 'Zod', 'Vite', 'Tailwind CSS', 'Socket.IO', 'MongoDB',
];
