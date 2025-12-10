# n8n Lead Enrichment UI

## The Graph
User pastes Apollo URL → Next.js UI → n8n webhook → MagicalAPI + Prospeo + Reoon → CSV download

## Invariants
- Never store API keys on server (client-side encrypted localStorage only)
- API keys passed to n8n per-request via webhook payload
- Always verify Apollo URL before triggering workflow
- Progress updates must be real-time (2s polling max)
- CSV must only contain deliverable emails
- Validate API keys are set before allowing enrichment
- Free tier: 10 LinkedIn URLs with server-side API keys (no user setup needed)

## Gotchas
- n8n webhooks are async (return jobId immediately, poll for progress)
- In-memory progress store resets on Vercel cold start (acceptable for MVP)
- Resend dark theme requires careful contrast ratios (WCAG AA minimum)
- API keys stored in encrypted localStorage (user must re-enter on device change)
- Web Crypto API encryption is browser-native but localStorage is still vulnerable to XSS
- Settings modal must validate keys before saving (non-empty strings)
- Free tier costs $0.50/user but drives 10% conversion at $139 LTV

## Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4 (dark theme)
- TypeScript 5.9
- n8n (workflow orchestration)
- Vercel (deployment)

## Commands
- `pnpm dev` - Local dev server
- `pnpm build` - Production build
- `pnpm lint` - ESLint check
- `npx vercel --prod` - Deploy to production
