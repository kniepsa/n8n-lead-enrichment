import { NextRequest, NextResponse } from 'next/server'
import { progressStore } from '@/lib/progress-store'
import { WorkflowStep } from '@/lib/types'

// POST: Update progress (called by n8n)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, step, processed, total, error } = body

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

    // Update progress
    progressStore.set(jobId, {
      ...current,
      step: step as WorkflowStep,
      processed: processed || current.processed,
      total: total || current.total,
      percentage: total ? Math.round((processed / total) * 100) : current.percentage,
      error: error,
      status: error ? 'error' : 'processing'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Progress callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
