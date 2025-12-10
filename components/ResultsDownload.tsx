'use client'

import { JobProgress } from '@/lib/types'

interface ResultsDownloadProps {
  progress: JobProgress
  onStartNew: () => void
}

export default function ResultsDownload({ progress, onStartNew }: ResultsDownloadProps) {
  const stats = progress.stats

  const handleDownload = () => {
    if (progress.downloadUrl) {
      window.open(progress.downloadUrl, '_blank')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-background-card border border-border rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            {progress.total} leads enriched!
          </h2>
          <p className="text-text-secondary">
            Your verified email list is ready to download
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-background-input border border-border rounded-lg p-4">
              <div className="text-3xl font-bold text-accent-success mb-1">
                {stats.deliverable}
              </div>
              <div className="text-sm text-text-secondary">Deliverable</div>
            </div>
            <div className="bg-background-input border border-border rounded-lg p-4">
              <div className="text-3xl font-bold text-accent-error mb-1">
                {stats.invalid}
              </div>
              <div className="text-sm text-text-secondary">Invalid/Risky</div>
            </div>
            <div className="bg-background-input border border-border rounded-lg p-4">
              <div className="text-3xl font-bold text-accent-primary mb-1">
                {stats.successRate}%
              </div>
              <div className="text-sm text-text-secondary">Success Rate</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="bg-accent-primary text-white px-8 py-3 rounded-md hover:opacity-90 transition font-medium"
          >
            Download CSV
          </button>
          <button
            onClick={onStartNew}
            className="border border-border text-text-primary px-8 py-3 rounded-md hover:bg-background-card transition"
          >
            Enrich More Leads
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-text-muted text-sm mb-3">
            Want to share your success?
          </p>
          <div className="flex gap-2 justify-center">
            <button className="text-text-secondary hover:text-text-primary transition text-sm">
              Share on Twitter
            </button>
            <span className="text-text-muted">•</span>
            <button className="text-text-secondary hover:text-text-primary transition text-sm">
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
