'use client'

import { useState, useEffect } from 'react'
import { loadApiKeys, getFreeCreditsRemaining, hasFreeCreditsAvailable } from '@/lib/storage'

interface EnrichmentFormProps {
  onSubmit: (data: { source: 'apollo_url' | 'linkedin_urls'; data: string | string[]; useFreeCredit: boolean; email?: string }) => void
  onOpenSettings: () => void
}

export default function EnrichmentForm({ onSubmit, onOpenSettings }: EnrichmentFormProps) {
  const [input, setInput] = useState('')
  const [email, setEmail] = useState('')
  const [notifyByEmail, setNotifyByEmail] = useState(false)
  const [hasKeys, setHasKeys] = useState(false)
  const [freeCredits, setFreeCredits] = useState(10)
  const [hasFreeCredits, setHasFreeCredits] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadApiKeys().then(keys => setHasKeys(keys !== null))
      setFreeCredits(getFreeCreditsRemaining())
      setHasFreeCredits(hasFreeCreditsAvailable())
    }
  }, [])

  const handleSubmit = (e: React.FormEvent, useFree: boolean = false) => {
    e.preventDefault()

    if (!input.trim()) {
      alert('Please enter LinkedIn URLs or an Apollo URL')
      return
    }

    if (useFree && !hasFreeCredits) {
      alert('No free credits remaining. Please enter your API keys.')
      return
    }

    if (!useFree && !hasKeys) {
      alert('Please configure your API keys first')
      onOpenSettings()
      return
    }

    if (notifyByEmail && !email.trim()) {
      alert('Please enter your email address')
      return
    }

    // Parse input
    const trimmed = input.trim()
    let source: 'apollo_url' | 'linkedin_urls' = 'linkedin_urls'
    let data: string | string[]

    if (trimmed.includes('apollo.io')) {
      source = 'apollo_url'
      data = trimmed
    } else {
      // Split by newlines or commas
      data = trimmed.split(/[\n,]+/).map(url => url.trim()).filter(Boolean)
      
      if (useFree && data.length > 10) {
        alert('Free tier limited to 10 LinkedIn URLs')
        return
      }
    }

    onSubmit({
      source,
      data,
      useFreeCredit: useFree,
      email: notifyByEmail ? email : undefined
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 animate-fade-in">
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-8 leading-tight tracking-tight">
          Close 10X More Deals Without Hiring SDRs
        </h1>
        <p className="text-text-secondary text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
          Sales teams use our AI-powered enrichment to verify 5,000+ emails while you grab coffee.
          No manual work. No guesswork. Just ready-to-contact leads.
        </p>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-6 mt-8 text-text-muted text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            2,847+ sales teams
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            4.9/5 rating
          </div>
          <div className="text-text-muted">1.2M+ leads enriched</div>
        </div>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="text-5xl font-bold text-accent-success mb-3">10 min</div>
          <div className="text-text-secondary text-lg">vs. 2 days manually</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-accent-primary mb-3">97%</div>
          <div className="text-text-secondary text-lg">email accuracy rate</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-text-primary mb-3">5,000+</div>
          <div className="text-text-secondary text-lg">leads per batch</div>
        </div>
      </div>

      <form className="bg-background-card border border-border rounded-xl p-8 md:p-10 shadow-dark animate-slide-up">
        <div className="mb-6">
          <label htmlFor="input" className="block text-text-primary text-lg mb-2 font-semibold">
            Paste your LinkedIn leads or Apollo URL
          </label>
          <p className="text-text-muted text-sm mb-4">
            Drop in up to 5,000 LinkedIn profile URLs or your Apollo.io search URL
          </p>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://app.apollo.io/...&#10;or&#10;https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith"
            className="w-full bg-background-input border-2 border-border rounded-xl px-6 py-5 text-text-primary focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/20 outline-none min-h-[200px] font-mono text-base transition-all"
          />
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={notifyByEmail}
              onChange={(e) => setNotifyByEmail(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-background-input checked:bg-accent-primary transition"
            />
            <span className="text-text-secondary text-base group-hover:text-text-primary transition">Email me when complete</span>
          </label>

          {notifyByEmail && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-3 w-full bg-background-input border border-border rounded-lg px-5 py-3 text-text-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none text-base transition-all"
            />
          )}
        </div>

        <div className="flex gap-4">
          {hasFreeCredits && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 bg-gradient-to-r from-accent-success to-emerald-400 text-white px-10 py-5 rounded-lg hover:shadow-glow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
            >
              Get 10 Free Verified Emails →
            </button>
          )}

          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            className="flex-1 bg-accent-primary text-white px-10 py-5 rounded-lg hover:shadow-glow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 font-bold text-lg border-2 border-transparent hover:border-accent-primary/50"
          >
            {hasKeys ? 'Start Enriching 5,000 Leads →' : 'Configure & Start Free Trial →'}
          </button>
        </div>

        {!hasKeys && (
          <p className="text-text-muted text-base mt-6 text-center">
            Don't have API keys?{' '}
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-accent-primary hover:text-accent-primary/80 hover:underline transition"
            >
              Configure them here
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
