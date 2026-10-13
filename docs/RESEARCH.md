# Research inventory

Internal working document. Drives every claim on the site. Inspected 2026-10-13.

## 1. Reference repositories: classification

| Repo | Class | License | Decision |
| --- | --- | --- | --- |
| [gargibhardwaj24/dossier](https://github.com/gargibhardwaj24/dossier) | Implementation code + design reference | **None** (all rights reserved by default) | Study only. Its code cannot be reused without a license, so the site is written from scratch. The stack choice (React + Vite + GSAP/ScrollTrigger + Lenis) is kept because it suits the brief, not copied. 39 MB of video assets and a JS-only codebase are also reasons not to fork it. |
| [deepika-builds/liquid-glass](https://github.com/deepika-builds/liquid-glass) | Implementation code (single-file, zero deps) | MIT | Vendored with its license notice. Used on one surface: the floating nav pill. A second use on the Quantus control panel was dropped because that panel sits on a flat ground where refraction has nothing to bend. Real refraction on Chromium, frosted fallback elsewhere, solid fill under `prefers-reduced-transparency`. |
| [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) | Agent skill + verification tooling | MIT | Already installed (plugin `nateherk-design` v0.3.1); the installed version is used. Its kie.ai image/video generation path is not used (no API key, and the portfolio's imagery should be real project screenshots). Its journey planning, depth, and `shoot.mjs` verification harness are used. |
| [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) | Agent skill (design guidance) | MIT | Not installed. Read from a clone and applied as a critique checklist instead of installing it into `~/.claude`. Dials: `DESIGN_VARIANCE 8 / MOTION_INTENSITY 7 / VISUAL_DENSITY 3`. Where its guidance conflicts with the brief (it recommends Motion over GSAP; it bans section theme changes), the brief wins and the reason is noted. |

## 2. Live references

- **Dossier**: portrait hero on saturated orange, dark blurred "journey" passage, condensed sans headlines with an italic serif accent word, scroll-drawn SVG curve, project grid, circle-reveal contact, viewport-wide wordmark footer.
- **Corn Revolution**: the built-in browser pane hit the site's unsupported-browser gate (no canvas mounted), so only its structure was readable: WebGL chaptered scroll story, heavy display face (Manifold CF Extra Bold) with Gilroy body. Spirit taken: warm field palette, chapters with a clear climax, depth through layered planes. Nothing copied.

## 3. Your projects (github.com/MOHIT-vp, 11 public repos)

Stars: 0 on every repo, so no star counts are shown anywhere.

| # | Repo | Verified description | Actual stack | Strongest contribution | Status | Links | Priority | Must NOT claim |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [HELIX-X](https://github.com/MOHIT-vp/HELIX-X) | Local research prototype ranking compound-disease hypotheses with a heterogeneous GNN; returns deterministic metapath evidence graphs. | PyTorch, PyTorch Geometric (3x `HGTConv`, 256-d, 4 heads), hybrid DistMult + TransE + dot-product decoder through a 3-16-1 MLP, FastAPI, Pydantic, Next.js, React, TypeScript, Tailwind, React Three Fiber, React Flow | Model architecture + inference service + evidence-graph UI, end to end. Embeddings cached at startup. 19 unittest cases. Explicit demo/production/unavailable modes. | Working demo on a synthetic Hetionet-shaped graph with an included checkpoint. Real Hetionet graph not in the repo. | Source only, 7 screenshots | **Featured, climax** | Scientific validity, accuracy, clinical relevance. README itself says demo scores are not scientifically meaningful. Do not publish the checkpoint's filename score as a metric. |
| 2 | [Agentic-Refund-Orchestrator](https://github.com/MOHIT-vp/Agentic-Refund-Orchestrator) | Routes refunds between card reversal and UPI provisional credit using three agents (MDR cost, retention risk, liquidity) under a deterministic supervisor with hard safety rules, a human review queue, a simulation lab, and an audit trail. | Python, FastAPI, SQLite, React 18, TypeScript, Vite, Recharts | Separating reasoning from execution: agents advise, a rules-first supervisor decides and can escalate. Pluggable `LLMProvider` with a malformed-output provider for failure testing. | Working prototype on synthetic data (generator seeds transactions). The retention agent currently uses `SimulatedLLMProvider`; no live LLM is wired. | Source only, 7 screenshots | **Featured** | "Production-grade", real cost savings, real merchants, a live LLM. MDR percentages in the README are domain assumptions, not results. |
| 3 | [Quantus](https://github.com/MOHIT-vp/Quantus) | B2B CRM MVP for institutional sales teams with role-based record visibility and an enforced deal-pipeline state machine. | React, Vite, TypeScript, Tailwind, Node, Express, TypeScript, PostgreSQL, Prisma, JWT + bcrypt, Zod, Jest + Supertest | Pipeline state machine (no stage skipping, terminal WON/LOST, value > 0 past QUALIFIED) and rep vs manager authorization. 18 API tests. Documented architecture, schema and API. | Complete MVP, runs locally. | Source only, 4 screenshots (GitHub attachments) | **Featured** | "Production-grade", usage by any institution. |
| 4 | [Multilingual-Lyric-Generator](https://github.com/MOHIT-vp/Multilingual-Lyric-Generator) | Generates original lyrics in Kannada, Hindi and English for a theme, emotion and style; retrieval-grounded; scores rhyme scheme and metre of the output. | Python, Streamlit, TF-IDF char n-gram retrieval, Gemini or Groq API, custom akshara-aware syllable and rhyme analyzer | Prosody verification loop: the app measures whether the output matches the requested rhyme/metre instead of trusting the model. | Working app; built in a 12-hour hackathon. | Source only, 2 screenshots (GitHub attachments) | **Featured (smaller)** | Hackathon placement or award (none found). Lyric quality claims. |
| 5 | [Parking-System](https://github.com/MOHIT-vp/Parking-System) | ESP32 + 4 IR sensors + servo gate over MQTT, with an Express browser simulation and dashboard. | C++ (Arduino), ESP32, MQTT (HiveMQ public broker), Node, Express, vanilla JS | Hardware-to-browser loop with QR vehicle validation topics. | Prototype. | Source, wiring + architecture + UI screenshots | Experiment | Deployment in a real car park. README calls it an academic prototype: that wording must not appear. |
| 6 | [medoswift](https://github.com/MOHIT-vp/medoswift) | MERN consultation and medicine-delivery app with RBAC, booking, prescription OCR, reminders and live order tracking. | React, Vite, Tailwind, Express, MongoDB, Socket.IO, Zod, Tesseract.js, Leaflet + OSM | Breadth: OCR, sockets and maps in one app. | 2 commits; payments are mocked. | Source, 7 screenshots (contain AI-style marketing banners; not used) | Experiment | Real payments, real doctors/pharmacies. |
| 7 | [NEXUS](https://github.com/MOHIT-vp/NEXUS) | Multi-agent (LangGraph) profile analysis with evidence grounding and self-healing regeneration. | FastAPI, LangChain, LangGraph, Gemini, PostgreSQL, Docker, Next.js | Team project (co-author: Aditya). Your commits: initial project, AI chatbot integration, UI polish. | Coursework-framed (lab phases, review sheet). | Source | Experiment (team project) | Coursework, labs, students or placement-cell framing (education restriction). Sole authorship. Present it as a team build and name only your verified commits. |
| - | forage-walmart, CommBank-Server, CommBank-Web | Forks of starter repos (Forage job simulations), 1 or 0 commits of yours. | | | | | Exclude | |
| - | project-X | README placeholder only. | | | | | Exclude | |

### Leads from the brief

- **HELIX-X**: verified (above).
- **Merchant-One / CPSE**: not present on github.com/MOHIT-vp. Not published, and per your instruction nothing from any other account is used.
- **AI/ML research, computer vision, representation analysis**: no public repo found. Not published.

## 4. Capabilities supported by evidence

- ML and graph learning: PyTorch, PyTorch Geometric, heterogeneous GNNs (HGT), knowledge-graph link prediction (DistMult, TransE)
- Applied LLM systems: retrieval-grounded generation, multi-agent orchestration with deterministic guardrails, provider abstraction, output verification
- Backend and APIs: FastAPI, Pydantic, Express, REST design, JWT auth, RBAC, Zod validation
- Data: PostgreSQL, Prisma, SQLite, MongoDB, migrations and seeding
- Frontend: React, Next.js, TypeScript, Vite, Tailwind, React Flow, React Three Fiber, Recharts, Leaflet
- Hardware: ESP32, MQTT, sensors and actuators
- Testing and tooling: unittest, Jest + Supertest, Docker Compose (NEXUS)

## 5. Contact facts

- Email: `mohitpatil04046@gmail.com` (Section 1 of the brief; also your commit email). Section 7G's `mailto@gmail.com` is treated as a typo.
- GitHub, LinkedIn, X: exact URLs from the brief.
- Location on GitHub profile: Hubli. Not used unless you want it.

## 6. Decisions (from your answers, 2026-10-13)

- Name: **Mohit Patil**. No title claimed. Positioning line: "I build software that shows its reasoning."
- Lead case studies: **HELIX-X** (climax) and **Agentic Refund Orchestrator**.
- Supporting work: Quantus, Multilingual Lyric Generator.
- Experiments: NEXUS (team project), Medoswift.
- Excluded: Parking-System, forks, project-X, and anything from the MOHITgit77 account.
- No portrait, no resume. Build locally, Vercel-ready, nothing pushed or published.
- Public GitHub data is read without authentication (the local `gh` session belongs to another account and is not used).

## 7. v2 decisions (2026-10-14)

- Rebuilt in the style of Dossier at Mohit's request, with his supplied hero design. Dossier's code and assets are not used (no licence).
- The hero figure is cut from the supplied mockup (`design/hero-mockup.webp`, regenerated by `scripts/hero-assets.py`). The second supplied image (Gargi Bhardwaj's portrait, "GB") is not used.
- Quantus and Lyric Generator screenshots were downloaded from their public READMEs on github.com/MOHIT-vp (anonymous requests; the local `gh` session was not used).
- Quantus screenshots show seeded sample data; captions and alt text say so. The Quantus sign-in screenshot was not used because it shows demo credentials.
- Medoswift claims checked against code: Socket.IO `order:update` events and OCR text matched against known medicine names.
- Experiments (NEXUS, Medoswift) became featured slides alongside the four main projects; Parking System stays excluded.
