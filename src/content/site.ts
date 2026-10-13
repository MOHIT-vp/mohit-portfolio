/**
 * Every visible claim on the site lives in this file.
 * Project facts are traceable to public repositories on github.com/MOHIT-vp
 * (see docs/RESEARCH.md). Edit copy here, not inside components.
 */

export const profile = {
  name: 'Mohit Patil',
  monogram: 'MP',
  email: 'mohitpatil04046@gmail.com',
  links: {
    github: 'https://github.com/MOHIT-vp',
    linkedin: 'https://www.linkedin.com/in/mohit-v-patil-a43b2a324',
    x: 'https://x.com/MohitPatil758',
  },
} as const;

export const socials = [
  { label: 'GitHub', href: profile.links.github },
  { label: 'LinkedIn', href: profile.links.linkedin },
  { label: 'X', href: profile.links.x },
] as const;

/** One label per intent, used everywhere on the page. */
export const labels = {
  work: 'Explore the work',
  connect: "Let's connect",
  source: 'Source on GitHub',
  caseStudy: 'Read the case study',
} as const;

export const navLinks = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
] as const;

export const hero = {
  eyebrow: 'Mohit Patil',
  /** First line in cream, the rest in gold, as in the supplied hero design. */
  title: ['Building', 'systems that', 'show their work'],
  sub: 'Apps, ML models and AI agents, built to be trusted.',
  /** The giant word set behind the figure. */
  backdrop: 'PORTFOLIO',
  tags: ['Models', 'Systems', 'Interfaces'],
  figureAlt: 'A figure in a carved, ribbed white mask and a dark draped cloak, lit from behind against orange smoke.',
};

export const dive = {
  /** Cut out of the rising panel; the camera dives through the first letter. */
  word: 'LOOK CLOSER',
  lead: 'from',
  line1: 'HELLO, WORLD!',
  line2: 'TO PRODUCTION.',
};

export const about = {
  statement: ['FROM DATA TO', 'INTERFACE,'],
  /** "I BUILD" + rotating word. The curve grows out of the I. */
  rotating: ['PRODUCTS', 'ML MODELS', 'AI AGENTS', 'BACKENDS'],
  intro:
    'I work across the whole stack, from data and models to APIs and the interfaces people use. I care most about software that is tested, honest about its limits and easy to trust.',
};

/** What I work on. Each one is backed by a public project and a real screenshot. */
export const roles = [
  { label: 'Full-Stack Development', proof: 'Quantus, Medoswift', shot: 'medo-tracking' },
  { label: 'Machine Learning', proof: 'HELIX-X, Lyric Generator', shot: 'helix-evidence' },
  { label: 'Agent Systems', proof: 'Refund Orchestrator, NEXUS', shot: 'refund-agents' },
  { label: 'Interface Design', proof: 'Quantus, HELIX-X', shot: 'quantus-pipeline' },
] as const;

export const principles = [
  {
    title: 'Show the reasoning, not only the result.',
    body: 'When my software makes a call, a score, a route, a recommendation, it keeps the inputs and the logic behind it so a person can check it.',
  },
  {
    title: 'Rules first, models second.',
    body: 'Anything probabilistic sits on top of deterministic checks: validation on the server, guardrails before an action, and a safe fallback when something fails.',
  },
  {
    title: 'Be clear about what is real.',
    body: 'Demo data, simulated services and known limits are labelled in the product itself, not buried in a README.',
  },
];

export type Shot = { src: string; alt: string; h: number };
export type Fact = { title: string; body: string };
export type Project = {
  id: string;
  name: string;
  kicker: string;
  /** Italic serif accent shown on the card. */
  tagline: string;
  summary: string;
  goal: string;
  points: Fact[];
  decisions?: string[];
  honesty?: string;
  stack: string[];
  status: string;
  limits?: string;
  repo: string;
  team?: string;
  shots: Shot[];
  /** Diagram keys from graphs.ts shown in the case study. */
  diagrams?: { key: string; caption: string }[];
  card: { size: 'big' | 'half'; tone: 'green' | 'paper' | 'cream' | 'ink' | 'brown' };
};

export const projects: Project[] = [
  {
    id: 'helix-x',
    name: 'HELIX-X',
    kicker: 'Biomedical graph inference',
    tagline: 'evidence, not just a score',
    summary:
      'A local research prototype that ranks compound and disease hypotheses with a heterogeneous graph neural network, then returns the graph paths behind every score.',
    goal: 'Make a link-prediction model inspectable: a ranking is only useful if you can see which structure in the graph produced it.',
    points: [
      { title: 'A typed graph', body: 'A Hetionet-shaped graph with 11 node types (compounds, genes, pathways, diseases, anatomy, side effects and more) and 24 forward relation types, each with a reverse edge.' },
      { title: 'Three HGT layers', body: 'Node features are projected to 256 dimensions and passed through three Heterogeneous Graph Transformer layers with four attention heads and per-type LayerNorm. Embeddings are computed once at startup and cached.' },
      { title: 'A hybrid decoder', body: 'Each compound and disease pair is scored three ways (DistMult, TransE and a dot product). A small 3 to 16 to 1 network learns how to combine them.' },
      { title: 'Evidence with every prediction', body: 'The API walks canonical metapaths such as compound, binds, gene, participates, pathway, gene, associates, disease, and returns a bounded, deterministic evidence graph.' },
    ],
    decisions: [
      'Explicit demo, production and unavailable modes. Without the real Hetionet files it runs on a deterministic synthetic graph and says so in the UI.',
      'No LLM, literature retrieval or API key in the loop. Evidence is structural graph traversal, labelled as such.',
      'FastAPI service with typed Pydantic schemas, OpenAPI docs and 19 unit tests across the model, loader, explainer and API.',
    ],
    stack: ['Python', 'PyTorch', 'PyTorch Geometric', 'FastAPI', 'Pydantic', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'React Flow', 'React Three Fiber'],
    status: 'Working prototype. Runs end to end on a synthetic graph with the included checkpoint.',
    limits: 'Scores are ranking outputs, not calibrated probabilities, and demo scores are not scientifically meaningful. Graph paths are not literature evidence.',
    repo: 'https://github.com/MOHIT-vp/HELIX-X',
    shots: [
      { src: 'helix-discover', h: 877, alt: 'HELIX-X landing screen: a dark green interface with the headline Discover what the biomedical graph knows, beside a knowledge-graph view of compounds, genes, pathways and diseases.' },
      { src: 'helix-evidence', h: 877, alt: 'HELIX-X evidence graph for Amoxicillin and Alzheimer’s disease: compound, gene and pathway nodes joined by binds, participates and associates edges, with a node inspector.' },
      { src: 'helix-method', h: 877, alt: 'HELIX-X methodology screen listing the pipeline: Hetionet, heterogeneous graph, three HGT layers, cached embeddings, hybrid decoder, compound-disease score and path explanation.' },
    ],
    diagrams: [
      { key: 'helix-0', caption: 'The 11 node types and their relations' },
      { key: 'helix-2', caption: 'The hybrid decoder' },
      { key: 'helix-3', caption: 'Two canonical metapaths from compound to disease' },
    ],
    card: { size: 'big', tone: 'green' },
  },
  {
    id: 'refund',
    name: 'Agentic Refund Orchestrator',
    kicker: 'Payments operations',
    tagline: 'agents advise, rules decide',
    summary:
      'Decides how each refund should travel, card reversal or UPI provisional credit, by weighing processing cost, customer retention risk and merchant liquidity.',
    goal: 'Let agents advise without letting them decide alone. Hard safety rules run first, and anything uncertain goes to a person.',
    points: [
      { title: 'Three advisors', body: 'An MDR cost agent compares route costs, a retention risk agent scores churn and dispute history, and a liquidity agent checks merchant credit ceilings.' },
      { title: 'Rules before routing', body: 'Stopping rules run before any route is chosen and cannot be overridden by an agent: high retention risk escalates, a liquidity breach forces card, a high UPI dispute rate disables UPI, and missing or malformed agent output falls back safely.' },
      { title: 'A person in the loop', body: 'Escalated cases land in a review queue with inline approval and manual routing.' },
      { title: 'Every decision on the record', body: 'The audit trail stores input snapshots, weights, thresholds and the reasoning behind each route.' },
    ],
    honesty:
      'The retention agent runs behind a pluggable LLM provider interface. The current build uses a simulated provider, plus a deliberately malformed one for failure testing. All transactions are synthetic.',
    stack: ['Python', 'FastAPI', 'SQLite', 'React 18', 'TypeScript', 'Vite', 'Recharts'],
    status: 'Working prototype on generated data, with a simulation lab for scripted scenarios.',
    repo: 'https://github.com/MOHIT-vp/Agentic-Refund-Orchestrator',
    shots: [
      { src: 'refund-agents', h: 916, alt: 'Refund detail view: MDR cost, retention risk and liquidity agent panels above a supervisor arbiter panel that explains why UPI provisional credit was selected.' },
      { src: 'refund-simulation', h: 916, alt: 'Simulation lab with scripted scenarios such as high-value order, constrained merchant liquidity, LLM agent timeout and end-to-end dispute simulation.' },
    ],
    diagrams: [{ key: 'refund', caption: 'Three agents advise, stopping rules run first, a supervisor routes or escalates' }],
    card: { size: 'half', tone: 'paper' },
  },
  {
    id: 'quantus',
    name: 'Quantus',
    kicker: 'B2B CRM',
    tagline: 'a pipeline the server enforces',
    summary:
      'A CRM for institutional sales teams where the deal pipeline is a state machine the server enforces, and reps only ever see the records assigned to them.',
    goal: 'Keep a sales pipeline honest: no skipped stages, no moves out of a closed deal, no deal past qualification without a value.',
    points: [
      { title: 'A validated state machine', body: 'Deals move forward exactly one stage at a time and backward to any earlier stage. WON and LOST are terminal. A deal needs a value above zero to move past QUALIFIED.' },
      { title: 'Role-based visibility', body: 'Reps see their own leads, opportunities and customers. Managers see the team, can reassign records and view team dashboards.' },
      { title: 'Typed, validated API', body: 'Express and TypeScript with Zod validation, JWT auth with bcrypt, and Prisma on PostgreSQL.' },
      { title: 'Tested and documented', body: '18 Jest and Supertest API tests, plus written architecture, schema and API documents.' },
    ],
    stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Zod', 'JWT', 'Jest', 'Supertest'],
    status: 'Complete MVP that runs locally with seeded sample data.',
    repo: 'https://github.com/MOHIT-vp/Quantus',
    shots: [
      { src: 'quantus-pipeline', h: 910, alt: 'Quantus pipeline board titled The living pipeline, with columns for New, Contacted, Qualified, Proposal and Negotiation holding seeded sample deals.' },
      { src: 'quantus-dashboard', h: 910, alt: 'Quantus manager dashboard with seeded sample figures: prospects, win rate, won value, pipeline cadence by stage and next actions.' },
    ],
    card: { size: 'half', tone: 'cream' },
  },
  {
    id: 'lyrics',
    name: 'Multilingual Lyric Generator',
    kicker: 'Generative AI, built in 12 hours',
    tagline: 'it checks its own rhymes',
    summary:
      'Writes original song lyrics in Kannada, Hindi and English for a theme, emotion and style, each written natively rather than translated, then measures its own metre and rhyme.',
    goal: 'Ground generation in each language’s own traditions, and verify the requested form instead of trusting the model.',
    points: [
      { title: 'Retrieve', body: 'Character n-gram TF-IDF retrieval over public lyric datasets, used as flavour, never copied.' },
      { title: 'Prompt', body: 'Language-specific cultural notes for folk, pop, classical and rap traditions.' },
      { title: 'Generate', body: 'Gemini or Groq, behind one provider switch, with backoff on rate limits.' },
      { title: 'Verify', body: 'An akshara-aware syllable counter and rhyme detector scores the requested scheme and metre.' },
    ],
    stack: ['Python', 'Streamlit', 'scikit-learn', 'pandas', 'Gemini API', 'Groq API'],
    status: 'Working app built during a 12-hour generative AI hackathon.',
    repo: 'https://github.com/MOHIT-vp/Multilingual-Lyric-Generator',
    shots: [
      { src: 'lyric-compare', h: 1023, alt: 'Lyric Forge comparison view: the same theme written in Kannada, Hindi and English side by side, each with rhyme, metre and syllable scores.' },
      { src: 'lyric-ui', h: 872, alt: 'Lyric Forge input screen with theme, emotion, musical style, rhyme scheme and metre controls, and Kannada, Hindi and English selected.' },
    ],
    card: { size: 'big', tone: 'ink' },
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    kicker: 'Team project, multi-agent',
    tagline: 'every insight gets an evidence record',
    summary:
      'A LangGraph pipeline of specialised agents that reads resumes and GitHub profiles, maps skills against role requirements, and attaches an evidence record to every generated insight.',
    goal: 'Keep generated career guidance traceable back to the inputs it came from.',
    points: [
      { title: 'Specialised agents', body: 'Coordinator, resume, coding analytics, skill gap, job matching, interview, validation and self-healing agents, wired as a LangGraph.' },
      { title: 'My part', body: 'The initial codebase, the assistant chat endpoint, an approvals API, the Docker Compose setup, and a rework of the dashboard and onboarding screens.' },
    ],
    stack: ['FastAPI', 'LangGraph', 'Gemini', 'PostgreSQL', 'Next.js', 'Docker'],
    status: 'Built with a teammate; my contributions are listed above.',
    repo: 'https://github.com/MOHIT-vp/NEXUS',
    team: 'Team project',
    shots: [],
    card: { size: 'half', tone: 'brown' },
  },
  {
    id: 'medoswift',
    name: 'Medoswift',
    kicker: 'Full stack, MERN',
    tagline: 'OCR, sockets and maps in one app',
    summary:
      'A consultation and medicine-delivery app with role-based access, doctor booking, prescription OCR, dose reminders and live order tracking on OpenStreetMap.',
    goal: 'Cover a whole service flow, from booking to delivery, in one codebase.',
    points: [
      { title: 'Prescription OCR', body: 'Tesseract.js reads uploaded prescriptions and matches medicines against the pharmacy catalogue.' },
      { title: 'Live tracking', body: 'Socket.IO pushes order state; Leaflet and OpenStreetMap show the route without an API key.' },
    ],
    stack: ['React', 'Express', 'MongoDB', 'Socket.IO', 'Tesseract.js', 'Leaflet'],
    status: 'Payments are mocked; everything else runs against MongoDB with seeded accounts.',
    repo: 'https://github.com/MOHIT-vp/medoswift',
    shots: [{ src: 'medo-tracking', h: 878, alt: 'Medoswift order tracking screen with a live OpenStreetMap view, courier details and an itemised order.' }],
    card: { size: 'half', tone: 'paper' },
  },
];

export const skills = [
  { group: 'Machine learning', items: ['PyTorch', 'PyTorch Geometric', 'Model training and inference', 'Embeddings and ranking'] },
  { group: 'LLM systems', items: ['Retrieval-grounded generation', 'Multi-agent orchestration', 'LangGraph', 'Provider abstraction', 'Output verification'] },
  { group: 'Backend and APIs', items: ['FastAPI', 'Pydantic', 'Express', 'REST design', 'JWT and RBAC', 'Zod', 'Socket.IO'] },
  { group: 'Data', items: ['PostgreSQL', 'Prisma', 'SQLite', 'MongoDB', 'Alembic migrations'] },
  { group: 'Interfaces', items: ['React', 'Next.js', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Flow', 'React Three Fiber', 'Recharts', 'Leaflet'] },
  { group: 'Testing and tooling', items: ['unittest', 'Jest', 'Supertest', 'Docker Compose'] },
];

export const contact = {
  lead: "Let's build something",
  rotating: ['that explains itself', 'worth inspecting', 'that holds up'],
  note: 'Open to conversations about full-stack products, machine learning and AI systems. Email is the fastest way to reach me.',
};
