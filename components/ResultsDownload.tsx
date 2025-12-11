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
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 animate-fade-in">
      <div className="bg-background-card border border-border rounded-xl p-10 md:p-12 text-center shadow-dark">
        <div className="mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-success/30 to-accent-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            <svg className="w-10 h-10 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            {progress.total} leads enriched!
          </h2>
          <p className="text-text-secondary text-lg md:text-xl">
            Your verified email list is ready to download
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-background-input border border-border rounded-xl p-6 transition-all hover:border-accent-success/30">
              <div className="text-4xl md:text-5xl font-bold text-accent-success mb-2">
                {stats.deliverable}
              </div>
              <div className="text-base text-text-secondary font-medium">Deliverable</div>
            </div>
            <div className="bg-background-input border border-border rounded-xl p-6 transition-all hover:border-accent-error/30">
              <div className="text-4xl md:text-5xl font-bold text-accent-error mb-2">
                {stats.invalid}
              </div>
              <div className="text-base text-text-secondary font-medium">Invalid/Risky</div>
            </div>
            <div className="bg-background-input border border-border rounded-xl p-6 transition-all hover:border-accent-primary/30">
              <div className="text-4xl md:text-5xl font-bold text-accent-primary mb-2">
                {stats.successRate}%
              </div>
              <div className="text-base text-text-secondary font-medium">Success Rate</div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="bg-accent-primary text-white px-8 py-4 rounded-lg hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-base"
          >
            Download CSV
          </button>
          <button
            onClick={onStartNew}
            className="border border-border text-text-primary px-8 py-4 rounded-lg hover:border-accent-primary/50 hover:bg-background-input transition-all duration-200 font-semibold text-base"
          >
            Enrich More Leads
          </button>
        </div>

        <div className="mt-10 pt-10 border-t border-border">
          <p className="text-text-muted text-base mb-4 font-medium">
            Want to share your success?
          </p>
          <div className="flex gap-3 justify-center">
            <button className="text-text-secondary hover:text-accent-primary transition text-base font-medium">
              Share on Twitter
            </button>
            <span className="text-text-muted">•</span>
            <button className="text-text-secondary hover:text-accent-primary transition text-base font-medium">
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
