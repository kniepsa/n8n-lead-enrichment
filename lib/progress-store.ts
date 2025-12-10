import { JobProgress } from './types'

// In-memory Map for job progress (resets on Vercel cold start - acceptable for MVP)
const store = new Map<string, JobProgress>()

export const progressStore = {
  get: (jobId: string): JobProgress | undefined => {
    return store.get(jobId)
  },

  set: (jobId: string, data: JobProgress): void => {
    store.set(jobId, data)
  },

  delete: (jobId: string): boolean => {
    return store.delete(jobId)
  },

  clear: (): void => {
    store.clear()
  },

  has: (jobId: string): boolean => {
    return store.has(jobId)
  }
}
