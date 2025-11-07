export type SummarySections = {
  target?: string
  benefit?: string
  period?: string
  method?: string
  note?: string
}

export function summarize(description?: string): string | undefined {
  if (!description) return undefined
  // Very naive rule-based summary: take first 2 sentences.
  const sents = description.replace(/\s+/g, ' ').split(/[.!?]\s+/)
  return sents.slice(0, 2).join('. ') + (sents.length > 0 ? '.' : '')
}

