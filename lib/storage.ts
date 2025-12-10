import { ApiKeys } from './types'

const STORAGE_KEY = 'lead_enrichment_api_keys'
const ENCRYPTION_KEY_NAME = 'lead_enrichment_key'

// Web Crypto API encryption for localStorage
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY_NAME),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('lead-enrichment-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function saveApiKeys(keys: ApiKeys): Promise<void> {
  try {
    const key = await getEncryptionKey()
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(keys))
    )

    const data = {
      iv: Array.from(iv),
      encrypted: Array.from(new Uint8Array(encrypted))
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save API keys:', error)
    throw new Error('Failed to save API keys securely')
  }
}

export async function loadApiKeys(): Promise<ApiKeys | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const { iv, encrypted } = JSON.parse(stored)
    const key = await getEncryptionKey()

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(encrypted)
    )

    return JSON.parse(new TextDecoder().decode(decrypted))
  } catch (error) {
    console.error('Failed to load API keys:', error)
    return null
  }
}

export function clearApiKeys(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKeys(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Free credits management
const FREE_CREDITS_KEY = 'lead_enrichment_free_credits'
const MAX_FREE_CREDITS = 10

export function getFreeCreditsUsed(): number {
  const used = localStorage.getItem(FREE_CREDITS_KEY)
  return used ? parseInt(used, 10) : 0
}

export function incrementFreeCredits(count: number = 1): void {
  const current = getFreeCreditsUsed()
  localStorage.setItem(FREE_CREDITS_KEY, String(current + count))
}

export function hasFreeCreditsAvailable(): boolean {
  return getFreeCreditsUsed() < MAX_FREE_CREDITS
}

export function getFreeCreditsRemaining(): number {
  return Math.max(0, MAX_FREE_CREDITS - getFreeCreditsUsed())
}
