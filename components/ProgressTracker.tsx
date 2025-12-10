'use client'

import { useEffect, useState } from 'react'
import { JobProgress } from '@/lib/types'

interface ProgressTrackerProps {
  jobId: string
  onComplete: (progress: JobProgress) => void
  onError: (error: string) => void
}

export default function ProgressTracker({ jobId, onComplete, onError }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<JobProgress | null>(null)

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/enrich?jobId=' + jobId)
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress')
        }

        const data: JobProgress = await response.json()
        setProgress(data)

        if (data.status === 'complete') {
          clearInterval(pollInterval)
          onComplete(data)
        } else if (data.status === 'error') {
          clearInterval(pollInterval)
          onError(data.error || 'Unknown error occurred')
        }
      } catch (error) {
        clearInterval(pollInterval)
        onError(error instanceof Error ? error.message : 'Failed to poll progress')
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [jobId, onComplete, onError])

  if (!progress) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-text-secondary mt-4">Initializing...</p>
      </div>
    )
  }

  const steps = [
    { key: 'scraping', label: 'Scraping Apollo URLs' },
    { key: 'prospeo_enrichment', label: 'Enriching with Prospeo' },
    { key: 'reoon_verification', label: 'Verifying with Reoon' },
    { key: 'filtering', label: 'Filtering deliverable emails' }
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-background-card border border-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
          Enriching Leads...
        </h2>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>{progress.processed} / {progress.total}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-accent-primary h-2 rounded-full transition-all duration-500"
              style={{ width: progress.percentage + '%' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = progress.step === step.key
            const isComplete = steps.findIndex(s => s.key === progress.step) > index
            
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={'w-6 h-6 rounded-full flex items-center justify-center ' + (
                  isComplete ? 'bg-accent-success' : 
                  isActive ? 'bg-accent-primary animate-pulse' : 
                  'bg-border'
                )}>
                  {isComplete && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={isActive || isComplete ? 'text-text-primary' : 'text-text-muted'}>
                    {step.label}
                  </p>
                  {isActive && progress.processed > 0 && (
                    <p className="text-text-secondary text-sm">
                      {progress.processed} / {progress.total} processed
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-text-muted text-sm text-center mt-8">
          This usually takes 8-12 minutes. Feel free to close this tab - we'll email you when it's done.
        </p>
      </div>
    </div>
  )
}
