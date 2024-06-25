import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 120 // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const anthropic = createAnthropic({ apiKey })

	const result = await streamText({
		model: anthropic(model),
		system: systemPrompt,
		messages,
		maxTokens: 4096,
		temperature: 0,
		seed: 42,
	})

	return result.toAIStreamResponse()
}
