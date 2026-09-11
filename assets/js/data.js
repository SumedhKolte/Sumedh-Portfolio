/* ------------------------------------------------------------------
   Content. Everything the editor can open lives here: the file list,
   the pane markup for each file, the terminal knowledge base and the
   sidebar data. Keeping it separate from app.js means adding a file
   is a data change, not a code change.
------------------------------------------------------------------- */

const CONTACT = {
  email: 'sumedhkolte19@gmail.com',
  // Phone is deliberately not published — it is shared over email on request.
  phoneNote: 'shared on request',
  github: 'https://github.com/sumedhkolte',
  linkedin: 'https://linkedin.com/in/sumedh-kolte',
  leetcode: 'https://leetcode.com/u/igdarksy/',
  resume: 'Sumedh_Resume__2026.pdf'
};

/* Repo per project. `null` means there is no public repository — the pane
   says so plainly instead of linking to a profile that does not contain it. */
const REPOS = {
  truecandidate: 'https://github.com/SumedhKolte/TrueCandidate',
  zapfix: 'https://github.com/SumedhKolte/zapfix',
  daysly: null,
  harmocare: null,
  aegis: 'https://github.com/SumedhKolte/aegis',
  flowforge: 'https://github.com/SumedhKolte/FlowFordge',
  synapse: 'https://github.com/SumedhKolte/synapse-CRM',
  catalog: 'https://github.com/SumedhKolte/codevector-catalog-engine',
  emi: 'https://github.com/SumedhKolte/1Fi-EMI-plans',
  onyx: 'https://github.com/SumedhKolte/Oynx'
};

/* Commit graph. `live: false` falls back to the illustrative pattern.
   The endpoint is a keyless public mirror of GitHub's contributions
   calendar — GitHub's own API needs a token, which a static site cannot
   hold safely. See README → "Connecting GitHub". */
const GITHUB = {
  user: 'sumedhkolte',
  live: true,
  endpoint: 'https://github-contributions-api.jogruber.de/v4/{user}?y=last'
};

const ROLES = [
  'Full Stack Developer (MERN)',
  'AI application builder',
  'Founder — HarmoCare',
  'B.Tech IT, June 2026'
];

const BOOT = [
  { tag: '[1/5]', text: 'resolving sumedh-kolte@2026', tone: 'fg2' },
  { tag: '[2/5]', text: 'linking 9 shipped projects', tone: 'fg2' },
  { tag: '[3/5]', text: 'mounting 5 domain services', tone: 'a3' },
  { tag: '[4/5]', text: 'warming LLM pipeline — 450ms budget', tone: 'a2' },
  { tag: '[5/5]', text: 'build succeeded · available now', tone: 'a1' }
];

const DEPTH = [
  { name: 'React / React Native', label: 'daily', w: '96%' },
  { name: 'Node · Express · FastAPI', label: 'daily', w: '92%' },
  { name: 'PostgreSQL · Supabase', label: 'daily', w: '88%' },
  { name: 'LLM pipelines · RAG', label: 'shipped', w: '84%' },
  { name: 'Docker · CI/CD · AWS', label: 'shipped', w: '72%' },
  { name: 'System design · DSA', label: 'studied', w: '78%' }
];

const DIFF = [
  { sign: '', text: 'harmocare/', kind: 'ctx' },
  { sign: '-', text: 'server/monolith.js            // single deployable, shared DB access', kind: 'del' },
  { sign: '-', text: 'server/routes/everything.js   // OPD + beds + EMR in one router', kind: 'del' },
  { sign: '-', text: 'auth/session-check.js         // ad-hoc role checks per route', kind: 'del' },
  { sign: '', text: '', kind: 'ctx' },
  { sign: '+', text: 'services/opd-booking/         // independently deployable', kind: 'add' },
  { sign: '+', text: 'services/bed-management/      // independently deployable', kind: 'add' },
  { sign: '+', text: 'services/emr/                 // independently deployable', kind: 'add' },
  { sign: '+', text: 'services/identity/            // JWT + RBAC across 3 roles, Google OAuth 2.0', kind: 'add' },
  { sign: '+', text: 'services/search/              // semantic vector search, results < 5s', kind: 'add' },
  { sign: '+', text: 'gateway/rest/                 // 10+ REST APIs exposed', kind: 'add' },
  { sign: '+', text: 'ci/docker-pipeline.yml        // automated delivery, 100% milestones on time', kind: 'add' }
];

/* Knowledge base for the assistant. `k` are match tokens, `a` the answer. */
const KB = [
  {
    k: ['who', 'summary', 'yourself', 'intro', 'bio', 'background'],
    a: 'Sumedh Kolte — Full Stack Developer (MERN) and AI application builder, B.Tech Information Technology from Shah and Anchor Kutchhi Engineering College, graduated June 2026. He founded and led an 8-member Agile team shipping an incubated healthcare MVP, and builds microservices, real-time systems and guarded LLM pipelines.'
  },
  {
    k: ['harmocare', 'experience', 'work', 'job', 'lead', 'team', 'founder', 'microservice', 'monolith', 'incubation', 'healthcare'],
    a: 'At HarmoCare (SAKEC Incubation Centre, Jan 2025 – Jan 2026) he was Founder & Team Lead. He led 8 engineers through Agile sprints delivering 100% of milestones on schedule, decomposed a monolith into 5 domain-driven services exposing 10+ REST APIs, and built semantic vector search returning under 5 seconds with JWT/RBAC and Google OAuth 2.0.'
  },
  {
    k: ['truecandidate', 'fraud', 'interview', 'impersonation', 'realtime', 'real-time'],
    a: 'TrueCandidate is a real-time candidate identification engine: 12+ weak-signal pipelines fused into one confidence score, a PostgreSQL trigger computing scores in-transaction so instances scale with zero coordination, and a Groq Llama 3.3 70B pipeline returning consistency verdicts in under 450 ms.'
  },
  {
    k: ['zapfix', 'repair', 'marketplace', 'mobile', 'react native', 'expo', 'android', 'ios'],
    a: 'Zapfix is an AI home-repair marketplace in React Native: dual-role app with a 9-state job lifecycle, Gemini 2.5 Flash vision diagnosing appliance faults from photos and video, 10+ Supabase Edge Functions with PostGIS matching and RLS across 18+ tables, Cashfree escrow, shipped to iOS and Android via EAS Build.'
  },
  {
    k: ['daysly', 'travel', 'compliance', 'tests', 'testing', 'schengen', 'offline'],
    a: 'Daysly is an offline-first travel compliance engine — a dependency-free TypeScript rules engine for Schengen 90/180, UK SRT and US SPT using integer civil-date arithmetic, an AI safety invariant where the engine decides and the LLM only narrates, and 192 unit and property-based tests with Vitest and fast-check.'
  },
  {
    k: ['aegis', 'escrow', 'arbitrator', 'trust engine', 'voice', 'negotiation'],
    a: 'Aegis is a P2P trust engine — two people negotiate a gig out loud and an AI arbitrator drafts the escrow contract from what was actually said. Every tool call the model makes is re-validated in Python before it touches money, funds lock only after three gates (deception risk, live-speaker challenge, solvency), and the money layer uses integer cents through SECURITY DEFINER Postgres functions with an append-only ledger. On a realistic scam thread it scores 95/DO_NOT_PROCEED versus 5/SAFE on a clean one, with zero false findings.'
  },
  {
    k: ['flowforge', 'flowfordge', 'workflow', 'agent builder', 'n8n', 'approval'],
    a: 'FlowForge is an AI agent workflow builder — six step types, four trigger types, and a run that pauses mid-flight at an approval gate and resumes in a different process. It has two independent permission layers (Postgres RLS plus engine role checks) with an executable isolation proof that must return PASS on every row, 32 engine unit tests, and a stub LLM mode that tags every fake completion so it cannot be mistaken for a real one.'
  },
  {
    k: ['synapse', 'crm', 'langgraph', 'hcp', 'pharma'],
    a: 'Synapse CRM inverts data entry: the form is read-only and reps never type into it. A LangGraph agent parses natural language, routes to one of five tools, and streams state back into the form field by field. Llama 3.3 70B does the routing, Llama 3.1 8B does extraction, and history search runs on local 768-dimension pgvector embeddings with no embedding API call. Corrections apply as diffs, so fixing a name leaves every other field intact.'
  },
  {
    k: ['catalog', 'pagination', 'keyset', 'cursor', 'offset', 'fastify', 'scale'],
    a: 'The Catalog Engine is a Fastify + PostgreSQL backend doing keyset (cursor) pagination over 200,000+ products, so paging stays correct while rows are being inserted — no duplicates and no skips, which an OFFSET feed cannot promise. It ships its own proof: an endpoint that inserts rows mid-session and a benchmark endpoint timing OFFSET against keyset at a chosen depth.'
  },
  {
    k: ['1fi', 'emi', 'instalment', 'installment', 'storefront', 'fintech', 'paise'],
    a: 'The 1Fi EMI Store is an instalment storefront backed by mutual-fund holdings, built for the 1Fi SDE1 assignment. Money is integer paise and rates are integer basis points, the EMI engine is a pure I/O-free routine exposed as POST /api/emi/quote, and the tests post the inputs behind every seeded plan to that endpoint and assert it agrees with the stored figures.'
  },
  {
    k: ['onyx', 'oynx', 'chat', 'socket', 'messaging', 'realtime chat'],
    a: 'Onyx is a real-time chat app — React Native and Expo on the front, Express and Socket.io with MongoDB Atlas behind, Supabase issuing the JWTs and Groq powering smart replies. Friends handshake, read receipts, vanishing messages, live polls and tic-tac-toe, verified by an end-to-end smoke script that runs the whole flow as 27 assertions.'
  },
  {
    k: ['skill', 'stack', 'tech', 'language', 'framework', 'tools'],
    a: 'Languages: JavaScript (ES6+), TypeScript, Python, SQL, C. Frontend: React, React Native, Zustand, React Query. Backend: Node, Express, FastAPI, microservices, WebSockets. Data: PostgreSQL, PostGIS, Supabase, MongoDB. AI: LLM integration, RAG, vector embeddings, semantic search, Gemini 2.5 Flash, Groq Llama 3/4. DevOps: Docker, CI/CD, AWS EC2/S3.'
  },
  {
    k: ['ai experience', 'ai work', 'llm', 'rag', 'gemini', 'groq', 'vector', 'embedding', 'machine learning', 'ai'],
    a: 'His AI work is production-shaped: RAG and vector search at HarmoCare, a latency-budgeted Groq pipeline under 450 ms at TrueCandidate, Gemini 2.5 Flash vision diagnosis at Zapfix, and a numeric guard at Daysly that rejects any figure the deterministic engine did not produce.'
  },
  {
    k: ['hire', 'available', 'availability', 'role', 'looking', 'contact', 'email', 'reach', 'notice period', 'salary'],
    a: 'He graduated in June 2026 and is available to start immediately, seeking SWE / Full Stack / AI Engineering roles — based in Mumbai, open to relocation and remote. Email sumedhkolte19@gmail.com; he shares a phone number on request.'
  },
  {
    k: ['education', 'college', 'degree', 'cgpa', 'certificate', 'certification', 'study', 'graduate'],
    a: 'B.Tech in Information Technology at Shah and Anchor Kutchhi Engineering College, Aug 2022 – June 2026, CGPA 7.92/10.0. IBM Data Science Professional Certificate (Coursera, 2023–24) with 90%+ across Python, SQL, ML, NLP and Generative AI, plus Full Stack Web Development with Acmegrade × IIT Bombay.'
  },
  {
    k: ['dsa', 'leetcode', 'algorithm', 'problem', 'data structure'],
    a: '135+ DSA problems solved; profile at leetcode.com/u/igdarksy. Core CS covers data structures, algorithms, OOP, system design, DBMS, operating systems and unit testing.'
  },
  {
    k: ['hardest', 'difficult', 'challenge', 'proud', 'toughest'],
    a: 'The hardest build was TrueCandidate. Fusing 12+ weak fraud signals into one trustworthy score meant moving computation into a PostgreSQL trigger so it ran in-transaction — that removed all cross-instance coordination — while keeping the Groq Llama 3.3 70B consistency verdict inside a 450 ms latency budget.'
  }
];

/* --- pane markup ---------------------------------------------------- */

const PANES = {

  'about.md': `
    <div class="pane pane--about">
      <div class="pane__kicker">/** about.md */</div>
      <h1 class="hero__name">Sumedh Kolte</h1>
      <div class="hero__typed"><span data-typed></span><span class="caret" aria-hidden="true">▌</span></div>
      <p class="hero__lede">Full Stack Developer (MERN) and AI application builder, graduated June 2026. Founded and led an 8-member Agile team shipping an incubated healthcare MVP; builds microservices, real-time systems, and guarded LLM pipelines. 135+ DSA problems solved. Seeking SWE / Full Stack / AI Engineering roles.</p>
      <div class="statgrid">
        <div><div class="stat__n" style="color:var(--a1)">8</div><div class="stat__l">engineers led</div></div>
        <div><div class="stat__n" style="color:var(--a2)">5</div><div class="stat__l">domain services shipped</div></div>
        <div><div class="stat__n" style="color:var(--a3)">450ms</div><div class="stat__l">LLM verdict latency</div></div>
        <div><div class="stat__n" style="color:var(--a1)">192</div><div class="stat__l">tests on Daysly engine</div></div>
        <div><div class="stat__n" style="color:var(--a2)">135+</div><div class="stat__l">DSA problems solved</div></div>
      </div>
      <div class="pills">
        <div class="pill">Mumbai, India</div>
        <div class="pill">Open to relocation &amp; remote</div>
        <div class="pill">B.Tech IT · June 2026</div>
        <div class="pill">Available immediately</div>
      </div>
      <div class="cta-row">
        <button class="btn-ghost btn-ghost--a1" data-act="open-terminal">Open terminal — try <code>hire</code></button>
        <button class="btn-ghost btn-ghost--a3" data-act="open-chat">Ask this portfolio a question</button>
      </div>
    </div>`,

  'experience.ts': `
    <div class="pane">
      <div class="pane__kicker">// experience.ts</div>
      <div class="split">
        <div>
          <div class="role-head">
            <h2>HarmoCare</h2><span>SAKEC Incubation Centre</span>
          </div>
          <div class="role-title">Founder &amp; Team Lead — Full Stack Developer (MERN Stack)</div>
          <div class="role-dates">Jan 2025 – Jan 2026 · Mumbai, India · Appreciation Letter</div>
          <div class="notes">
            <div class="note">Led an 8-member Agile/Scrum team through sprint planning and code reviews, delivering 100% of milestones on schedule for a production-ready healthcare MVP under institutional incubation.</div>
            <div class="note note--a2">Architected a healthcare platform for OPD booking, bed management, and EMR by decomposing a monolith into 5 domain-driven services exposing 10+ REST APIs, each independently deployable.</div>
            <div class="note note--a3">Built semantic vector search returning results in under 5 seconds; secured 3 user roles via JWT with RBAC and Google OAuth 2.0, and automated delivery through Docker and CI/CD pipelines.</div>
          </div>
          <button class="btn-ghost btn-ghost--sm" data-act="open-file" data-file="impact.diff">View architecture diff →</button>
        </div>
        <div class="card">
          <div class="card__label">STACK</div>
          <div class="tags">
            <span>MongoDB</span><span>Express.js</span><span>React.js</span><span>Node.js</span>
            <span>Docker</span><span>CI/CD</span><span>JWT · RBAC</span><span>OAuth 2.0</span><span>Vector search</span>
          </div>
          <div class="rule"></div>
          <div class="kvlist">
            <div><span>Team size</span><span>8</span></div>
            <div><span>Services</span><span>5</span></div>
            <div><span>REST APIs</span><span>10+</span></div>
            <div><span>Roles secured</span><span>3</span></div>
            <div><span>Milestones on time</span><span style="color:var(--a1)">100%</span></div>
          </div>
        </div>
      </div>
    </div>`,

  'truecandidate.ts': `
    <div class="pane">
      <div class="pane__kicker">// projects/truecandidate.ts</div>
      <h2 class="proj-title">TrueCandidate</h2>
      <div class="proj-sub">Real-Time Candidate Identification Engine</div>
      <div class="proj-stack">FastAPI · PostgreSQL (Supabase) · Groq (Llama 3.3 70B) · React · WebSockets · Event-Driven Architecture</div>
      <div class="split">
        <div class="notes">
          <div class="note">Built a real-time fraud-detection system flagging impersonation and proxy fraud in live video interviews, combining 12+ weak-signal scoring pipelines into one confidence score.</div>
          <div class="note note--a2">Designed an event-driven scoring engine where a PostgreSQL trigger computes all scores in-transaction, allowing backend instances to scale horizontally with zero cross-instance coordination.</div>
          <div class="note note--a3">Engineered a latency-budgeted LLM pipeline on Groq (Llama 3.3 70B) returning consistency verdicts in under 450 ms, surfaced through a React dashboard replaying score history over Postgres Realtime WebSockets.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">&lt;450ms</div><div class="metric__l">LLM consistency verdict</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">12+</div><div class="metric__l">weak-signal pipelines fused</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">0</div><div class="metric__l">cross-instance coordination</div></div>
          <a class="metric-link" href="${REPOS.truecandidate}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'zapfix.tsx': `
    <div class="pane">
      <div class="pane__kicker">// projects/zapfix.tsx</div>
      <h2 class="proj-title">Zapfix</h2>
      <div class="proj-sub">AI-Powered Home Repair Marketplace</div>
      <div class="proj-stack">React Native · Expo · Supabase · Gemini 2.5 Flash (Vision) · Groq (Llama 4) · PostGIS · Deno Edge Functions</div>
      <div class="split">
        <div class="notes">
          <div class="note">Built a dual-role React Native app with a 9-state job lifecycle and real-time location tracking, powered by an AI diagnosis engine on Gemini 2.5 Flash (vision + text) detecting appliance faults from user photos and video.</div>
          <div class="note note--a2">Designed 10+ Supabase Edge Functions (Deno/TS) with PostGIS matching and Row-Level Security across 18+ tables; integrated Cashfree escrow and shipped to iOS and Android via EAS Build.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">9</div><div class="metric__l">state job lifecycle</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">18+</div><div class="metric__l">tables under RLS</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">iOS · Android</div><div class="metric__l">shipped via EAS Build</div></div>
          <a class="metric-link" href="${REPOS.zapfix}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'daysly.ts': `
    <div class="pane">
      <div class="pane__kicker">// projects/daysly.ts</div>
      <h2 class="proj-title">Daysly</h2>
      <div class="proj-sub">Offline-First Travel Compliance Engine</div>
      <div class="proj-stack">TypeScript · React Native (Expo) · SQLite · Supabase Edge Functions · Groq · Gemini · Vitest · fast-check</div>
      <div class="split">
        <div class="notes">
          <div class="note">Built a dependency-free TypeScript rules engine for Schengen 90/180, UK SRT, and US SPT thresholds using integer civil-date arithmetic instead of epoch subtraction, making results immune to DST and timezone drift.</div>
          <div class="note note--a2">Enforced an AI safety invariant where the engine decides and the LLM only narrates: model output passes a numeric guard rejecting any date or day count not returned by an engine tool call, eliminating hallucinated figures.</div>
          <div class="note note--a3">Wrote 192 unit and property-based tests (Vitest + fast-check) cross-checking the engine against a naive set-based oracle; shipped local-first with SQLite as source of truth and opt-in sync under Row-Level Security.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">192</div><div class="metric__l">unit + property tests</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">3</div><div class="metric__l">jurisdictional rulesets</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">0</div><div class="metric__l">runtime dependencies</div></div>
          <div class="metric-link metric-link--muted">Private repo — walkthrough on request</div>
        </div>
      </div>
    </div>`,

  'aegis.ts': `
    <div class="pane">
      <div class="pane__kicker">// projects/aegis.ts</div>
      <h2 class="proj-title">Aegis</h2>
      <div class="proj-sub">P2P Trust Engine &amp; AI Arbitrator</div>
      <div class="proj-stack">Next.js 15 · FastAPI · OpenAI Realtime (speech-to-speech) · WebRTC · Supabase Postgres · gpt-4o vision</div>
      <div class="split">
        <div class="notes">
          <div class="note">Two people negotiate a gig out loud; an AI arbitrator sits in the call, drafts the escrow contract from what was actually said, and holds the money. The browser owns the WebRTC session, but <strong>every tool call the model makes is re-validated in Python before it can touch funds</strong> — nothing the model says is trusted on its own.</div>
          <div class="note note--a2">Escrow locks only when three independent gates pass: cumulative deception risk below the halt threshold, a live-speaker challenge passed within 10 minutes, and verified buyer solvency. A refusal returns 200 with a spoken summary so the arbitrator reads the reason aloud instead of failing silently.</div>
          <div class="note note--a3">Money never touches a float. <code>price_cents</code> is the only authoritative amount and <code>price_usd</code> is a generated column, so displayed and settled values cannot drift. Every movement runs through a <code>SECURITY DEFINER</code> Postgres function that row-locks, mutates the wallet and appends to an append-only ledger in one transaction — triggers reject any UPDATE or DELETE on ledger rows. Dispute splits are integer basis points with the buyer absorbing the remainder, so the ledger always nets to zero.</div>
          <div class="note">Guardian ingests deals struck elsewhere (Fiverr, Discord, WhatsApp) and runs the same six-pattern forensics. The model must quote verbatim to raise a finding and the backend drops any quote it cannot locate in the source text; terms that were never stated stay null rather than being guessed — an invented number would be locked into a real contract.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">95 / 5</div><div class="metric__l">risk score — scam thread vs clean thread, zero findings on the clean one</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">3</div><div class="metric__l">gates before funds lock</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">0</div><div class="metric__l">floating-point values in the money layer</div></div>
          <a class="metric-link" href="${REPOS.aegis}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'flowforge.ts': `
    <div class="pane">
      <div class="pane__kicker">// projects/flowforge.ts</div>
      <h2 class="proj-title">FlowForge</h2>
      <div class="proj-sub">AI agent workflow builder — a small, opinionated n8n</div>
      <div class="proj-stack">Next.js 15 · Express execution engine · Supabase (Postgres · RLS · Realtime) · React Flow · Groq · pg_net</div>
      <div class="split">
        <div class="notes">
          <div class="note">Six step types and four trigger types over one state machine. An <code>approval_gate</code> pauses a run mid-flight for a human and the run <strong>resumes in a different process</strong> — the engine is stateless between steps, so execution survives a restart or a second instance picking it up.</div>
          <div class="note note--a2">Two independent permission layers: Postgres row-level security underneath, role checks in the engine above it. The schema ships an executable isolation proof — <code>rls_isolation.sql</code> must return PASS on every row before the security model is considered correct, so tenancy is verified rather than assumed.</div>
          <div class="note note--a3">With no LLM key configured, <code>llm_call</code> falls back to a deterministic local classifier — and every such result is tagged <code>provider: "stub"</code> with a disclosure string the UI renders as a warning. A stubbed completion can never be mistaken for a real one, which is the difference between a demo and a lie.</div>
          <div class="note">Database-event triggers reach the engine over <code>pg_net</code> and <strong>fail closed</strong>: until the engine URL is explicitly configured, events are still recorded but nothing is posted outward, so a fresh clone never calls a stranger's server.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">6 · 4</div><div class="metric__l">step types · trigger types</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">32</div><div class="metric__l">engine unit tests, no network or DB needed</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">2</div><div class="metric__l">independent permission layers</div></div>
          <a class="metric-link" href="${REPOS.flowforge}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'synapse-crm.py': `
    <div class="pane">
      <div class="pane__kicker">// projects/synapse-crm.py</div>
      <h2 class="proj-title">Synapse CRM</h2>
      <div class="proj-sub">AI-first HCP interaction module</div>
      <div class="proj-stack">FastAPI · LangGraph · Groq (Llama 3.3 70B + 3.1 8B) · pgvector · React + Redux · Supabase Realtime · whisper-large-v3</div>
      <div class="split">
        <div class="notes">
          <div class="note">Inverts the usual CRM: the form on the left is <strong>read-only</strong> and reps never type into it. Every write, edit, history lookup and compliance check happens in natural language on the right; a LangGraph agent routes the message to one of five tools and streams the resulting state back into the form field by field.</div>
          <div class="note note--a2">Two models chosen by role — Llama 3.3 70B is the routing brain deciding which tool to call, Llama 3.1 8B does extraction and generation. The large model is only asked the question that actually needs it, which keeps per-message cost and latency down.</div>
          <div class="note note--a3">Corrections apply as diffs, not rewrites. “Actually the name was Dr. John and the sentiment was negative” changes exactly two fields and preserves everything else — the hard part of a conversational form, and the reason freshly-updated fields flash so the rep can see what moved.</div>
          <div class="note">History search runs on local 768-dimension BAAI/bge-base-en-v1.5 embeddings matched to a <code>vector(768)</code> pgvector column, so semantic lookup needs no embedding API call.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">5</div><div class="metric__l">agent tools behind one chat box</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">2</div><div class="metric__l">models split by role — routing vs extraction</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">768-dim</div><div class="metric__l">local embeddings, no embedding API</div></div>
          <a class="metric-link" href="${REPOS.synapse}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'catalog-engine.js': `
    <div class="pane">
      <div class="pane__kicker">// projects/catalog-engine.js</div>
      <h2 class="proj-title">Catalog Engine</h2>
      <div class="proj-sub">Stable pagination over 200k+ products</div>
      <div class="proj-stack">Node.js · Fastify · PostgreSQL · Pino · Vitest + Supertest · React + Vite</div>
      <div class="split">
        <div class="notes">
          <div class="note">Keyset (cursor) pagination instead of <code>OFFSET</code>, so paging stays <strong>correct while rows are being written</strong> — no duplicates, no skipped records. The usual <code>OFFSET</code> feed silently shifts under you the moment someone inserts a row above your page.</div>
          <div class="note note--a2">The claim is demonstrable rather than asserted: <code>POST /api/simulate-inserts</code> writes new rows mid-session so you can watch a feed stay stable, and <code>GET /api/benchmark</code> times <code>OFFSET</code> against keyset at a chosen depth. Building the proof into the API is the part most implementations skip.</div>
          <div class="note note--a3">Opaque bidirectional cursors, with a timestamptz precision fix so a cursor round-trips exactly. The honest tradeoff is prev/next rather than jump-to-page — inherent to cursor pagination, and precisely what buys the stability.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">200k+</div><div class="metric__l">rows seeded via batched UNNEST inserts</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">0.84ms</div><div class="metric__l">DB time on the documented sample page query</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">0</div><div class="metric__l">duplicates or skips under concurrent writes</div></div>
          <a class="metric-link" href="${REPOS.catalog}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'emi-store.ts': `
    <div class="pane">
      <div class="pane__kicker">// projects/emi-store.ts</div>
      <h2 class="proj-title">1Fi EMI Store</h2>
      <div class="proj-sub">Instalment storefront backed by mutual-fund holdings</div>
      <div class="proj-stack">Next.js · TypeScript · PostgreSQL · Vitest · typed REST API</div>
      <div class="split">
        <div class="notes">
          <div class="note">Money is <code>INTEGER</code> paise and rates are <code>INTEGER</code> basis points — no floating point anywhere in the financial path, so a displayed figure and a charged figure cannot diverge by a rounding cent.</div>
          <div class="note note--a2">The EMI engine is a pure, I/O-free routine exposed as <code>POST /api/emi/quote</code>. The test suite posts the inputs behind <strong>every seeded plan</strong> to that endpoint and asserts it agrees with the stored figures — the API and the database can never quietly disagree.</div>
          <div class="note note--a3"><code>tests/data-layer.test.ts</code> re-derives every stored figure from the formula and fails if it drifts, and invariants like <code>downPayment + principal === price</code> are asserted on both routes. The amortisation table renders from the same routine that produced the stored totals, so the schedule cannot contradict the summary.</div>
          <div class="note">Nothing on the page is hardcoded in a component — products, variants, pricing and every EMI offer are served from Postgres through the typed API, with deep-linkable variant URLs.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">paise</div><div class="metric__l">integer money, zero floats</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">100%</div><div class="metric__l">of seeded plans re-derived from the formula in tests</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a3)">5</div><div class="metric__l">tables, constraint- and index-backed</div></div>
          <a class="metric-link" href="${REPOS.emi}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'onyx.tsx': `
    <div class="pane">
      <div class="pane__kicker">// projects/onyx.tsx</div>
      <h2 class="proj-title">Onyx</h2>
      <div class="proj-sub">Real-time chat</div>
      <div class="proj-stack">Node · Express · Socket.io · MongoDB Atlas · Supabase JWT · React Native (Expo SDK 51) · Groq</div>
      <div class="split">
        <div class="notes">
          <div class="note">Realtime DMs behind a friends handshake — request, accept over a realtime notification, then a private room appears. Read receipts, vanishing messages, live polls, tic-tac-toe and Groq-powered smart replies on top of one Socket.io connection.</div>
          <div class="note note--a2">Auth and message storage are deliberately separate concerns: Supabase issues and signs the JWT, the Express server verifies it, and Mongo holds the messages. Swapping either side does not disturb the other.</div>
          <div class="note note--a3">Ships an end-to-end smoke script rather than a claim — <code>backend/scripts/smoke.js</code> drives auth → friends → chat → read receipts → polls → game rules → vanish → sync as 27 assertions against a running server.</div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="metric__n" style="color:var(--a1)">27</div><div class="metric__l">end-to-end smoke checks</div></div>
          <div class="metric"><div class="metric__n" style="color:var(--a2)">iOS · Android</div><div class="metric__l">one Expo codebase, native build prebuilt</div></div>
          <a class="metric-link" href="${REPOS.onyx}" target="_blank" rel="noreferrer">View source on GitHub →</a>
        </div>
      </div>
    </div>`,

  'skyline.3d': `
    <div class="pane pane--skyline">
      <div class="pane__kicker">// skyline.3d — live from github.com/${GITHUB.user}</div>
      <h2 class="proj-title">Repository skyline</h2>
      <div class="proj-sub">Every public repo, rendered as a city</div>
      <div class="proj-stack">Hand-written perspective projection on a 2D canvas · no three.js, no WebGL, no dependencies · one GitHub API call</div>

      <div class="skyline">
        <canvas data-skyline-canvas aria-label="3D city of GitHub repositories"></canvas>
        <div class="skyline__tip" data-skyline-tip hidden></div>
        <div class="skyline__status" data-skyline-status>Loading…</div>
      </div>

      <div class="skyline__bar">
        <button type="button" data-skyline-spin aria-pressed="true">Pause rotation</button>
        <button type="button" data-skyline-all aria-pressed="false">Showing 2026 only</button>
        <span class="skyline__count" data-skyline-count></span>
      </div>

      <div class="skyline__legend" data-skyline-legend></div>

      <p class="skyline__hint">Drag to orbit · scroll to zoom · click a building to open that repository on GitHub. Building height is the log of repo size, so a 28&nbsp;MB project does not flatten a 200&nbsp;KB one.</p>
    </div>`,

  'skills.package.json': `
    <div class="pane pane--skills">
      <div class="codeview">
        <div class="codeview__lines">
          ${[
            '{',
            '<span class="i1"><span class="k">"name"</span>: <span class="s">"sumedh-kolte"</span>,</span>',
            '<span class="i1"><span class="k">"role"</span>: <span class="s">"full-stack + ai engineer"</span>,</span>',
            '<span class="i1"><span class="k">"coreCS"</span>: [<span class="s">"Data Structures &amp; Algorithms"</span>, <span class="s">"OOP"</span>, <span class="s">"System Design"</span>, <span class="s">"DBMS"</span>, <span class="s">"Operating Systems"</span>, <span class="s">"Unit Testing"</span>],</span>',
            '<span class="i1"><span class="k">"dependencies"</span>: {</span>',
            '<span class="i2"><span class="k2">"languages"</span>: <span class="s">"JavaScript (ES6+), TypeScript, Python, SQL, C"</span>,</span>',
            '<span class="i2"><span class="k2">"frontend"</span>: <span class="s">"React.js, React Native, HTML5, CSS3, Zustand, React Query"</span>,</span>',
            '<span class="i2"><span class="k2">"backend"</span>: <span class="s">"Node.js, Express.js, FastAPI, REST APIs, Microservices, WebSockets"</span>,</span>',
            '<span class="i2"><span class="k2">"architecture"</span>: <span class="s">"Event-Driven, Spec-Driven"</span>,</span>',
            '<span class="i2"><span class="k2">"auth"</span>: <span class="s">"JWT, OAuth 2.0, RBAC, Row-Level Security"</span>,</span>',
            '<span class="i2"><span class="k2">"databases"</span>: <span class="s">"PostgreSQL, PostGIS, Supabase, MongoDB"</span>,</span>',
            '<span class="i2"><span class="k2">"ai"</span>: <span class="s">"LLM Integration, RAG, Vector Embeddings, Semantic Search, NLP, Scikit-Learn"</span>,</span>',
            '<span class="i2"><span class="k2">"models"</span>: <span class="s">"Gemini 2.5 Flash (Vision + Text), Groq (Llama 3/4)"</span>,</span>',
            '<span class="i2"><span class="k2">"devops"</span>: <span class="s">"Docker, CI/CD Pipelines, Git, GitHub, Postman, AWS (EC2, S3)"</span>,</span>',
            '<span class="i2"><span class="k2">"process"</span>: <span class="s">"Agile/Scrum"</span></span>',
            '<span class="i1">},</span>',
            '<span class="i1"><span class="k">"scripts"</span>: {</span>',
            '<span class="i2"><span class="k2">"hire"</span>: <span class="s">"mailto:sumedhkolte19@gmail.com"</span>,</span>',
            '<span class="i2"><span class="k2">"start"</span>: <span class="s">"available immediately"</span></span>',
            '<span class="i1">}</span>',
            '}'
          ].map((line, i) =>
            `<div class="cl"><span class="cl__n">${i + 1}</span><span class="cl__t">${line}</span></div>`
          ).join('')}
        </div>
      </div>
      <div class="depth">
        <div class="depth__label">DEPTH</div>
        ${DEPTH.map(d => `
          <div class="depth__row">
            <div class="depth__head"><span>${d.name}</span><em>${d.label}</em></div>
            <div class="depth__track"><div class="depth__fill" style="width:${d.w}"></div></div>
          </div>`).join('')}
      </div>
    </div>`,

  'impact.diff': `
    <div class="pane pane--diff">
      <div class="diff__head">diff --git a/harmocare/monolith b/harmocare/services</div>
      <div class="diff__body">
        ${DIFF.map((d, i) => `
          <div class="dl dl--${d.kind}">
            <span class="dl__n">${i + 1}</span>
            <span class="dl__s">${d.sign}</span>
            <span class="dl__t">${d.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>
          </div>`).join('')}
      </div>
      <div class="diff__foot">Decomposition delivered under institutional incubation at SAKEC, Jan 2025 – Jan 2026. Each service independently deployable behind Docker and CI/CD.</div>
    </div>`,

  'dsa.json': `
    <div class="pane pane--dsa">
      <div class="pane__kicker">// dsa.json</div>
      <h2 style="font-size:34px;margin:0 0 30px;letter-spacing:-0.02em;">Problem solving</h2>
      <div class="bigstats">
        <div><div class="bigstat__n" style="color:var(--a1)">135+</div><div class="stat__l">problems solved</div></div>
        <div><div class="bigstat__n" style="color:var(--a2)">7.92</div><div class="stat__l">CGPA / 10.0</div></div>
        <div><div class="bigstat__n" style="color:var(--a3)">90%+</div><div class="stat__l">IBM Data Science cert</div></div>
      </div>
      <div style="color:var(--fg2);line-height:1.8;margin-bottom:20px;">Core CS coverage: Data Structures &amp; Algorithms, OOP, System Design, DBMS, Operating Systems, Unit Testing.</div>
      <a href="${CONTACT.leetcode}" target="_blank" rel="noreferrer">leetcode.com/u/igdarksy →</a>
    </div>`,

  'education.md': `
    <div class="pane pane--edu">
      <div class="pane__kicker">/** education.md */</div>
      <h2 style="font-size:34px;margin:0 0 32px;letter-spacing:-0.02em;">Education &amp; Certifications</h2>
      <div class="timeline">
        <div class="timeline__h">Shah and Anchor Kutchhi Engineering College</div>
        <div class="timeline__s">B.Tech, Information Technology · CGPA 7.92/10.0</div>
        <div class="timeline__d">Aug 2022 – June 2026</div>
      </div>
      <div class="timeline timeline--a2">
        <div class="timeline__h">IBM Data Science Professional Certificate</div>
        <div class="timeline__s">Coursera, 2023–24 · 90%+ across Python, SQL, ML, NLP, Generative AI</div>
      </div>
      <div class="timeline timeline--a3" style="margin-bottom:0">
        <div class="timeline__h">Full Stack Web Development</div>
        <div class="timeline__s">Acmegrade × IIT Bombay, 2023</div>
      </div>
    </div>`,

  'now.md': `
    <div class="pane pane--now">
      <div class="pane__kicker">/** now.md */</div>
      <h2 style="font-size:34px;margin:0 0 30px;letter-spacing:-0.02em;">Now</h2>
      <div class="nowlist">
        <div><span style="color:var(--a1)">▸</span><span>Graduated B.Tech Information Technology in June 2026 — interviewing now.</span></div>
        <div><span style="color:var(--a2)">▸</span><span>Hardening TrueCandidate's scoring engine and latency budget on Groq.</span></div>
        <div><span style="color:var(--a3)">▸</span><span>Extending Daysly's rules engine coverage with property-based tests.</span></div>
        <div><span style="color:var(--a1)">▸</span><span>Open to SWE / Full Stack / AI Engineering roles — Mumbai, relocation, or remote. Available to start immediately.</span></div>
      </div>
    </div>`,

  'contact.tsx': `
    <div class="pane pane--contact">
      <div class="pane__kicker">// contact.tsx</div>
      <h2 style="font-size:34px;margin:0 0 10px;letter-spacing:-0.02em;">Get in touch</h2>
      <p style="color:var(--fg2);margin:0 0 32px;line-height:1.7;">Fastest route is email. The form composes a message in your mail client.</p>
      <div class="split">
        <form class="form" data-contact-form novalidate>
          <label class="sr-only" for="cf-name">Your name</label>
          <input id="cf-name" name="name" placeholder="Your name" autocomplete="name">
          <label class="sr-only" for="cf-org">Company or role</label>
          <input id="cf-org" name="org" placeholder="Company / role" autocomplete="organization">
          <label class="sr-only" for="cf-msg">What are you building?</label>
          <textarea id="cf-msg" name="msg" placeholder="What are you building?" rows="6"></textarea>
          <button type="submit">Send message</button>
        </form>
        <dl class="contactlist">
          <div><dt>EMAIL</dt><dd><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></dd></div>
          <div><dt>PHONE</dt><dd style="color:var(--fg2)">${CONTACT.phoneNote} — ask by email</dd></div>
          <div><dt>LINKEDIN</dt><dd><a href="${CONTACT.linkedin}" target="_blank" rel="noreferrer">in/sumedh-kolte</a></dd></div>
          <div><dt>GITHUB</dt><dd><a href="${CONTACT.github}" target="_blank" rel="noreferrer">github.com/sumedhkolte</a></dd></div>
          <div><dt>LEETCODE</dt><dd><a href="${CONTACT.leetcode}" target="_blank" rel="noreferrer">leetcode.com/u/igdarksy</a></dd></div>
          <div><dt>LOCATION</dt><dd style="color:var(--fg)">Mumbai, India · open to relocation &amp; remote</dd></div>
        </dl>
      </div>
    </div>`
};

const FILES = [
  { id: 'about.md', icon: 'M', color: 'a3', meta: 'markdown · profile', group: 'root' },
  { id: 'experience.ts', icon: 'TS', color: 'a2', meta: 'HarmoCare · Jan 2025 – Jan 2026', group: 'root' },
  { id: 'skills.package.json', icon: '{}', color: 'a1', meta: 'dependency view', group: 'root' },
  { id: 'skyline.3d', icon: '◱', color: 'a3', meta: '3D repo city · live from GitHub', group: 'root' },
  { id: 'impact.diff', icon: '±', color: 'a2', meta: 'monolith → 5 services', group: 'root' },
  { id: 'dsa.json', icon: '{}', color: 'a1', meta: '135+ problems solved', group: 'root' },
  { id: 'education.md', icon: 'M', color: 'a3', meta: 'B.Tech IT · certifications', group: 'root' },
  { id: 'now.md', icon: 'M', color: 'a3', meta: 'currently building', group: 'root' },
  { id: 'contact.tsx', icon: 'TS', color: 'a2', meta: 'reach out', group: 'root' },
  { id: 'aegis.ts', icon: 'TS', color: 'a2', meta: 'AI escrow arbitrator · voice', group: 'proj' },
  { id: 'flowforge.ts', icon: 'TS', color: 'a2', meta: 'AI agent workflow engine', group: 'proj' },
  { id: 'truecandidate.ts', icon: 'TS', color: 'a2', meta: 'real-time fraud detection', group: 'proj' },
  { id: 'synapse-crm.py', icon: 'PY', color: 'a1', meta: 'AI-first CRM · LangGraph', group: 'proj' },
  { id: 'catalog-engine.js', icon: 'JS', color: 'a1', meta: 'keyset pagination · 200k rows', group: 'proj' },
  { id: 'zapfix.tsx', icon: 'TS', color: 'a2', meta: 'AI home repair marketplace', group: 'proj' },
  { id: 'daysly.ts', icon: 'TS', color: 'a2', meta: 'offline-first compliance engine', group: 'proj' },
  { id: 'emi-store.ts', icon: 'TS', color: 'a2', meta: 'integer-money EMI storefront', group: 'proj' },
  { id: 'onyx.tsx', icon: 'TS', color: 'a2', meta: 'real-time chat · React Native', group: 'proj' }
];
