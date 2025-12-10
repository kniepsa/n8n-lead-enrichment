import { EnrichmentRequest } from './types'

export async function triggerN8nWorkflow(
  request: EnrichmentRequest,
  jobId: string
): Promise<Response> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL not configured')
  }

  const payload = {
    jobId,
    source: request.source,
    data: request.data,
    apiKeys: request.apiKeys,
    email: request.email,
    useFreeCredit: request.useFreeCredit
  }

  return fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}
