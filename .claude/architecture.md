# Architecture

## System Overview

```mermaid
graph TB
    User[User] -->|Paste URL| UI[Next.js UI]
    UI -->|POST /api/enrich| API[API Route]
    API -->|Trigger webhook| N8N[n8n Workflow]
    N8N -->|Scrape| Magic[MagicalAPI]
    Magic -->|5000 URLs| N8N
    N8N -->|Enrich| Prospeo[Prospeo API]
    Prospeo -->|Emails| N8N
    N8N -->|Verify| Reoon[Reoon API]
    Reoon -->|Deliverable| N8N
    N8N -->|CSV| Storage[Temp Storage]
    N8N -->|Callback| API
    API -->|Progress| UI
    UI -->|Download| User
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant n8n
    participant APIs

    User->>NextJS: Paste Apollo URL
    NextJS->>n8n: POST webhook (jobId + URL + API keys)
    n8n-->>NextJS: Return jobId immediately
    NextJS->>User: Show progress UI

    loop Every 2 seconds
        NextJS->>NextJS: Poll /api/enrich?jobId=xxx
    end

    n8n->>APIs: MagicalAPI scrape
    APIs-->>n8n: 5000 LinkedIn URLs
    n8n->>NextJS: POST /api/enrich/progress (step: scraping complete)

    n8n->>APIs: Prospeo enrich (batch 100)
    APIs-->>n8n: Emails + metadata
    n8n->>NextJS: POST /api/enrich/progress (2341/5000 processed)

    n8n->>APIs: Reoon verify (POWER mode)
    APIs-->>n8n: Deliverability status
    n8n->>NextJS: POST /api/enrich/progress (verification complete)

    n8n->>n8n: Filter deliverable only
    n8n->>n8n: Generate CSV
    n8n->>NextJS: POST /api/enrich/complete (downloadUrl + stats)

    NextJS->>User: Show success + download button
    User->>NextJS: Click download
    NextJS->>User: CSV file
```

## Component Structure

```
app/
├── page.tsx (State machine: idle | processing | complete | error)
├── layout.tsx (Dark theme wrapper)
└── api/
    └── enrich/
        ├── route.ts (POST: trigger, GET: poll)
        ├── progress/route.ts (n8n callback)
        └── complete/route.ts (n8n callback)

components/
├── EnrichmentForm.tsx (Input + validation)
├── ProgressTracker.tsx (Live progress display)
├── ResultsDownload.tsx (Stats + CSV download)
└── SettingsModal.tsx (API key config)

lib/
├── types.ts (TypeScript interfaces)
├── progress-store.ts (In-memory Map)
├── storage.ts (Encrypted localStorage)
└── n8n.ts (Webhook client)
```
