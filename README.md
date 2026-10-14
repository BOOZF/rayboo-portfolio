# rayboo-portfolio

Ray Boo's 3D portfolio: walk a space bridge, step into project bubbles, and ask an AI assistant about Ray.

Built with React, Vite and three.js; the "Ask about Ray" chat is a Vercel serverless function (`api/chat.js`) doing file-based RAG over `knowledge/*.md` with OpenAI.

## Develop

```bash
pnpm install
cp .env.example .env   # add OPENAI_API_KEY
pnpm dev               # site + /api/chat on http://localhost:5173
pnpm test              # chat RAG + API tests
```

After editing anything in `knowledge/`, rebuild the search index: `pnpm knowledge`.

## Deploy (Vercel)

Import the repo, then set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-5-mini`) under Settings → Environment Variables.
