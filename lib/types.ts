export type JobStatus = 'processing' | 'complete' | 'error'
export type WorkflowStep = 'scraping' | 'prospeo_enrichment' | 'reoon_verification' | 'filtering'

export interface JobProgress {
  jobId: string
  status: JobStatus
  step: WorkflowStep
  processed: number
  total: number
  percentage: number
  downloadUrl?: string
  stats?: {
    deliverable: number
    invalid: number
    successRate: number
  }
  error?: string
}

export interface ApiKeys {
  magicalApi: string
  prospeo: string
  reoon: string
  apollo?: string
}

export interface EnrichmentRequest {
  source: 'apollo_url' | 'csv' | 'linkedin_urls'
  data: string | string[]
  apiKeys?: ApiKeys
  email?: string  // Optional email for notification
  useFreeCredit?: boolean  // For free tier (10 URLs)
}

export interface LeadData {
  linkedin_url: string
  email?: string
  verification_status?: 'deliverable' | 'risky' | 'invalid'
  first_name?: string
  last_name?: string
  company?: string
}
