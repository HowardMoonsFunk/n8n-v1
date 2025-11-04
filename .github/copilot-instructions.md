<!-- Project-specific Copilot instructions (auto-generated) -->

# Copilot instructions — n8n-v1 (brief)

Purpose: bootstrap an AI coding agent for a freshly-cloned repository that blends n8n workflows and a custom workflow engine.

Quick facts (what exists)
- Runtime: Node.js >=18 (see `package.json` / `engines`).
- Entry point: `index.js` (Express app exposing `/health`, `/api/*`).
- Workflow/system code lives in `workflow-engine/` and `workflows/` (n8n definitions). See `CUSTOM_SOLUTION.md` for intended architecture.
- Playwright scripts under `playwright/` for scraping and tests. Environment example: `.env.example`.
- Key scripts: `start` (node index.js), `dev` (nodemon), `n8n` and `n8n:dev` (starts n8n). See `package.json`.
- Dependencies: `express`, `dotenv`, `axios`, `playwright`. Dev: `jest`, `eslint`, `nodemon`.

How to run locally (facts, exact commands)
- Install: `npm ci` (uses `package-lock.json`).
- Dev server: `npm run dev` (nodemon -> `index.js`).
- Production: `npm start` (node `index.js`).
- n8n: `npm run n8n` or `npm run n8n:dev` (if using n8n flows directly).
- Tests: `npm test` (jest). Lint: `npm run lint`.

Bootstrap/environment notes
- Copy `.env.example` -> `.env` and fill API credentials before running integrations or playwright scrapers.
- Node must be 18+ (project enforces `engines`), prefer Homebrew or nvm and ensure `PATH` contains node bin.

Project conventions & patterns (concrete)
- API server: `index.js` exposes health and simple endpoints; extend `/api/*` for workflow/integration operations.
- Workflows: store declarative workflow JSON in `workflows/` and use `workflow-engine/` to parse/execute them.
- Data sanitization: `scripts/data-sanitizer.js` + `CUSTOM_SOLUTION.md` outline a `DataSanitizer` used before external publish.
- Playwright: place scrapers in `playwright/scrapers/` and use `playwright/tests/` for end-to-end checks.

Search targets for agent actions (where to look first)
- `index.js` — server entry and endpoints
- `workflow-engine/**` — execution engine and node implementations (if present)
- `workflows/**` — JSON workflow examples/templates
- `scripts/` — utilities (sanitizer, validators)
- `playwright/` and `tests/` — scraping and e2e examples
- `README.md`, `CUSTOM_SOLUTION.md`, `guide.md` — design intent and runbook

Small examples (copy-paste patterns)
- Health endpoint (already present): `GET /health` -> return status+timestamp.
- Start server consistent pattern:
  - Read env (`dotenv`), set PORT default, app.listen(PORT, () => console.log(...)).

Edge cases & safeguards for AI edits
- Do not remove or leak `.env.example` or any credential placeholder files.
- Preserve `package.json` scripts and `engines` unless user asks to upgrade Node major.
- When adding new integrations, place connector code in `workflow-engine` or `integrations/` and update `configs/integrations.json`.

Post-generation question
- "Would you like me to refine this with real examples from `workflow-engine` (implementation snippets) or expand the developer workflow steps?"

Keep edits minimal and factual — update this file only when you can cite repository files.
