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
    <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
          Enrich 5,000 LinkedIn profiles in 10 minutes
        </h1>
        <p className="text-text-secondary text-xl md:text-2xl">
          What took 2 days now takes a coffee break.
        </p>
      </div>

      <form className="bg-background-card border border-border rounded-xl p-8 md:p-10 shadow-dark animate-slide-up">
        <div className="mb-6">
          <label htmlFor="input" className="block text-text-secondary text-base mb-3 font-medium">
            Paste Apollo URL or LinkedIn URLs (one per line)
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://app.apollo.io/...&#10;or&#10;https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith"
            className="w-full bg-background-input border border-border rounded-lg px-5 py-4 text-text-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none min-h-[160px] font-mono text-sm transition-all"
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
              className="flex-1 bg-accent-success text-white px-8 py-4 rounded-lg hover:shadow-glow hover:scale-[1.02] transition-all duration-200 font-semibold text-base"
            >
              Try Free ({freeCredits} credits left)
            </button>
          )}

          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            className="flex-1 bg-accent-primary text-white px-8 py-4 rounded-lg hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-base"
          >
            {hasKeys ? 'Enrich Leads' : 'Configure API Keys'}
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
