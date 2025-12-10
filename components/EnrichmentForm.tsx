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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Enrich 5,000 LinkedIn profiles in 10 minutes
        </h1>
        <p className="text-text-secondary text-lg">
          What took 2 days now takes a coffee break.
        </p>
      </div>

      <form className="bg-background-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="input" className="block text-text-secondary text-sm mb-2">
            Paste Apollo URL or LinkedIn URLs (one per line)
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://app.apollo.io/...&#10;or&#10;https://linkedin.com/in/john-doe&#10;https://linkedin.com/in/jane-smith"
            className="w-full bg-background-input border border-border rounded-md px-4 py-3 text-text-primary focus:border-border-focus outline-none min-h-[120px] font-mono text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyByEmail}
              onChange={(e) => setNotifyByEmail(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-text-secondary text-sm">Email me when complete</span>
          </label>
          
          {notifyByEmail && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-2 w-full bg-background-input border border-border rounded-md px-4 py-2 text-text-primary focus:border-border-focus outline-none text-sm"
            />
          )}
        </div>

        <div className="flex gap-3">
          {hasFreeCredits && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 bg-accent-success text-white px-6 py-3 rounded-md hover:opacity-90 transition font-medium"
            >
              Try Free ({freeCredits} credits left)
            </button>
          )}

          <button
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            className="flex-1 bg-accent-primary text-white px-6 py-3 rounded-md hover:opacity-90 transition font-medium"
          >
            {hasKeys ? 'Enrich Leads' : 'Configure API Keys'}
          </button>
        </div>

        {!hasKeys && (
          <p className="text-text-muted text-sm mt-4 text-center">
            Don't have API keys?{' '}
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-accent-primary hover:underline"
            >
              Configure them here
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
