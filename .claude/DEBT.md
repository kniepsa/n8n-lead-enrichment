# Technical Debt

## Known Issues

### Performance
- **In-memory progress store** - Resets on Vercel cold starts. Consider Upstash Redis for production.
- **2s polling** - Works for MVP but consider Server-Sent Events (SSE) for scale.

### Security
- **localStorage encryption** - Vulnerable to XSS. Consider moving API keys to server-side with auth.

### UX
- **No offline support** - Users must stay online during enrichment (10-minute wait).
- **Mobile responsive** - Dark theme needs testing on mobile devices.

## Future Refactors
- Replace polling with SSE for real-time updates
- Add retry logic for n8n webhook failures
- Implement proper error boundary components
- Add API key validation before enrichment starts
