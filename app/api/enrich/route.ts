import { NextRequest, NextResponse } from 'next/server'
import { progressStore } from '@/lib/progress-store'
import { triggerN8nWorkflow } from '@/lib/n8n'
import { EnrichmentRequest } from '@/lib/types'

// POST: Trigger n8n workflow
export async function POST(request: NextRequest) {
  try {
    const body: EnrichmentRequest = await request.json()

    // Validate input
    if (!body.data || (Array.isArray(body.data) && body.data.length === 0)) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    // For paid tier, check API keys
    if (!body.useFreeCredit && !body.apiKeys) {
      return NextResponse.json(
        { error: 'API keys required for paid tier' },
        { status: 400 }
      )
    }

    // Generate unique job ID
    const jobId = crypto.randomUUID()

    // If using free credit, add server-side API keys
    if (body.useFreeCredit) {
      body.apiKeys = {
        magicalApi: process.env.FREE_TIER_MAGICAL_API_KEY || '',
        prospeo: process.env.FREE_TIER_PROSPEO_API_KEY || '',
        reoon: process.env.FREE_TIER_REOON_API_KEY || ''
      }
    }

    // Trigger n8n webhook
    const response = await triggerN8nWorkflow(body, jobId)

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`)
    }

    // Initialize progress tracker
    progressStore.set(jobId, {
      jobId,
      status: 'processing',
      step: 'scraping',
      processed: 0,
      total: Array.isArray(body.data) ? body.data.length : 5000,
      percentage: 0
    })

    return NextResponse.json({ jobId })
  } catch (error) {
    console.error('Enrich API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Poll for progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    const progress = progressStore.get(jobId)

    if (!progress) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Poll API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
