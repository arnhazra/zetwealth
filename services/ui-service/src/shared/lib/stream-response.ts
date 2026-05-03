import { streamApi } from "./ky-api"

export async function streamConversationResponse(
  url: string,
  body: Record<string, unknown>,
  onToken: (token: string) => void,
  onThreadId: (threadId: string) => void
): Promise<void> {
  const response = await streamApi.post(url, { json: body })

  const reader = response.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const data = line.slice(6)
      if (data === "[DONE]") return

      try {
        const event = JSON.parse(data)
        if (event.type === "token") {
          onToken(event.data)
        } else if (event.type === "threadId") {
          onThreadId(event.data)
        }
      } catch {
        // skip malformed events
      }
    }
  }
}
