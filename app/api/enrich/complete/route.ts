import { NextRequest, NextResponse } from 'next/server'
import { progressStore } from '@/lib/progress-store'

// POST: Mark job as complete (called by n8n)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, downloadUrl, stats, error } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    const current = progressStore.get(jobId)

    if (!current) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Mark as complete
    progressStore.set(jobId, {
      ...current,
      status: error ? 'error' : 'complete',
      percentage: 100,
      downloadUrl,
      stats,
      error
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
