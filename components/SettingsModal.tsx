'use client'

import { useState, useEffect } from 'react'
import { saveApiKeys, loadApiKeys, clearApiKeys } from '@/lib/storage'
import { ApiKeys } from '@/lib/types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<ApiKeys>({
    magicalApi: '',
    prospeo: '',
    reoon: '',
    apollo: ''
  })
  const [showKeys, setShowKeys] = useState({
    magicalApi: false,
    prospeo: false,
    reoon: false,
    apollo: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadApiKeys().then(loaded => {
        if (loaded) {
          setKeys(loaded)
        }
      })
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!keys.magicalApi || !keys.prospeo || !keys.reoon) {
      alert('MagicalAPI, Prospeo, and Reoon keys are required')
      return
    }

    setSaving(true)
    try {
      await saveApiKeys(keys)
      alert('API keys saved successfully!')
      onClose()
    } catch (error) {
      alert('Failed to save API keys: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all API keys?')) {
      clearApiKeys()
      setKeys({ magicalApi: '', prospeo: '', reoon: '', apollo: '' })
      alert('API keys cleared')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card border border-border rounded-lg max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">API Configuration</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              MagicalAPI Key *
            </label>
            <div className="relative">
              <input
                type={showKeys.magicalApi ? 'text' : 'password'}
                value={keys.magicalApi}
                onChange={(e) => setKeys({ ...keys, magicalApi: e.target.value })}
                placeholder="magical_api_key_here"
                className="w-full bg-background-input border border-border rounded-md px-4 py-2 text-text-primary focus:border-border-focus outline-none pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, magicalApi: !showKeys.magicalApi })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showKeys.magicalApi ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Prospeo API Key *
            </label>
            <div className="relative">
              <input
                type={showKeys.prospeo ? 'text' : 'password'}
                value={keys.prospeo}
                onChange={(e) => setKeys({ ...keys, prospeo: e.target.value })}
                placeholder="prospeo_api_key_here"
                className="w-full bg-background-input border border-border rounded-md px-4 py-2 text-text-primary focus:border-border-focus outline-none pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, prospeo: !showKeys.prospeo })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showKeys.prospeo ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Reoon API Key *
            </label>
            <div className="relative">
              <input
                type={showKeys.reoon ? 'text' : 'password'}
                value={keys.reoon}
                onChange={(e) => setKeys({ ...keys, reoon: e.target.value })}
                placeholder="reoon_api_key_here"
                className="w-full bg-background-input border border-border rounded-md px-4 py-2 text-text-primary focus:border-border-focus outline-none pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, reoon: !showKeys.reoon })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showKeys.reoon ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Apollo API Key (optional)
            </label>
            <div className="relative">
              <input
                type={showKeys.apollo ? 'text' : 'password'}
                value={keys.apollo || ''}
                onChange={(e) => setKeys({ ...keys, apollo: e.target.value })}
                placeholder="apollo_api_key_here"
                className="w-full bg-background-input border border-border rounded-md px-4 py-2 text-text-primary focus:border-border-focus outline-none pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, apollo: !showKeys.apollo })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showKeys.apollo ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-text-muted text-xs mt-1">
              Only needed if using free Apollo tier API access
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent-primary text-white px-6 py-3 rounded-md hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Keys'}
          </button>
          <button
            onClick={handleClear}
            className="border border-border text-text-primary px-6 py-3 rounded-md hover:bg-background-input transition"
          >
            Clear All
          </button>
        </div>

        <p className="text-text-muted text-xs mt-4 text-center">
          Keys are encrypted and stored locally in your browser. We never send them to our servers.
        </p>
      </div>
    </div>
  )
}
