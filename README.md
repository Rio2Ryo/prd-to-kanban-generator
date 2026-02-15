# PRD → Kanban Generator

Tiny web app that turns a PRD-ish input into a **Todo/Doing/Done** kanban skeleton.

- Works **without any LLM key** (deterministic template generator)
- Outputs **Markdown** (copy/paste into Notion/GitHub) and **JSON** (download/copy)

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import to Vercel
3. Deploy

> Optional (later): add LLM integration via env vars.

## Demo flow (30s)

1. Type Goal / Constraints / Duration / Team
2. Copy Markdown
3. Paste into your task tool

## Roadmap (if we continue)

- LLM mode (OpenAI/Anthropic) for smarter task breakdown
- Export formats: GitHub Projects, Jira CSV
- Drag & drop board UI
