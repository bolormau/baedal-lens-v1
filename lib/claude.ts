export function parseClaudeJSON<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = fenced ? fenced[1] : text
  try {
    return JSON.parse(jsonStr.trim()) as T
  } catch {
    return null
  }
}
