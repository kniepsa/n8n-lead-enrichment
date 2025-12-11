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
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center animate-fade-in">
        <div className="animate-spin h-12 w-12 border-4 border-accent-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-text-secondary text-lg mt-6">Initializing...</p>
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
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 animate-fade-in">
      <div className="bg-background-card border border-border rounded-xl p-10 md:p-12 shadow-dark">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-10 text-center">
          Enriching Leads...
        </h2>

        <div className="mb-10">
          <div className="flex justify-between text-base text-text-secondary mb-3 font-medium">
            <span>{progress.processed} / {progress.total}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="bg-accent-primary h-3 rounded-full transition-all duration-500 shadow-glow"
              style={{ width: progress.percentage + '%' }}
            />
          </div>
        </div>

        <div className="space-y-5">
          {steps.map((step, index) => {
            const isActive = progress.step === step.key
            const isComplete = steps.findIndex(s => s.key === progress.step) > index

            return (
              <div key={step.key} className="flex items-center gap-4 transition-all duration-300">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center transition-all ' + (
                  isComplete ? 'bg-accent-success shadow-glow' :
                  isActive ? 'bg-accent-primary animate-pulse-slow shadow-glow-lg' :
                  'bg-border'
                )}>
                  {isComplete && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={'font-medium text-base transition-colors ' + (isActive || isComplete ? 'text-text-primary' : 'text-text-muted')}>
                    {step.label}
                  </p>
                  {isActive && progress.processed > 0 && (
                    <p className="text-text-secondary text-sm mt-1">
                      {progress.processed} / {progress.total} processed
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-text-muted text-base text-center mt-10">
          This usually takes 8-12 minutes. Feel free to close this tab - we'll email you when it's done.
        </p>
      </div>
    </div>
  )
}
