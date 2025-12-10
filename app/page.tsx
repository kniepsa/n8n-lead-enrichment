'use client'

import { useState } from 'react'
import EnrichmentForm from '@/components/EnrichmentForm'
import ProgressTracker from '@/components/ProgressTracker'
import ResultsDownload from '@/components/ResultsDownload'
import SettingsModal from '@/components/SettingsModal'
import { loadApiKeys, incrementFreeCredits } from '@/lib/storage'
import { JobProgress } from '@/lib/types'

type AppState = 'idle' | 'processing' | 'complete' | 'error'

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [jobId, setJobId] = useState<string>('')
  const [progress, setProgress] = useState<JobProgress | null>(null)
  const [error, setError] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleStartEnrichment = async (data: {
    source: string
    data: string | string[]
    useFreeCredit: boolean
    email?: string
  }) => {
    try {
      const apiKeys = data.useFreeCredit ? undefined : await loadApiKeys()

      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: data.source,
          data: data.data,
          useFreeCredit: data.useFreeCredit,
          email: data.email,
          apiKeys
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start enrichment')
      }

      const result = await response.json()
      
      if (data.useFreeCredit) {
        const count = Array.isArray(data.data) ? data.data.length : 1
        incrementFreeCredits(count)
      }

      setJobId(result.jobId)
      setState('processing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }

  const handleComplete = (finalProgress: JobProgress) => {
    setProgress(finalProgress)
    setState('complete')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setState('error')
  }

  const handleStartNew = () => {
    setState('idle')
    setJobId('')
    setProgress(null)
    setError('')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with settings */}
      <div className="max-w-2xl mx-auto px-6 py-4 flex justify-end">
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-text-secondary hover:text-text-primary transition flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {state === 'idle' && (
        <EnrichmentForm
          onSubmit={handleStartEnrichment}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {state === 'processing' && (
        <ProgressTracker
          jobId={jobId}
          onComplete={handleComplete}
          onError={handleError}
        />
      )}

      {state === 'complete' && progress && (
        <ResultsDownload
          progress={progress}
          onStartNew={handleStartNew}
        />
      )}

      {state === 'error' && (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-background-card border border-accent-error rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-accent-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              {error}
            </p>
            <button
              onClick={handleStartNew}
              className="bg-accent-primary text-white px-8 py-3 rounded-md hover:opacity-90 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-8 text-center text-text-muted text-sm">
        <p>
          Powered by MagicalAPI, Prospeo, and Reoon •{' '}
          <a href="#" className="hover:text-text-primary transition">
            Privacy Policy
          </a>
        </p>
      </footer>
    </main>
  )
}
