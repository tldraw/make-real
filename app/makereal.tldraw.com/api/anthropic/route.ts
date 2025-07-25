import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 60 // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const anthropic = createAnthropic({ apiKey })

	if (model === 'claude-3-7-sonnet-20250219 (thinking)') {
		const result = streamText({
			model: anthropic('claude-3-7-sonnet-20250219'),
			system: systemPrompt,
			messages,
			providerOptions: {
				anthropic: {
					thinking: { type: 'enabled', budgetTokens: 12000 },
				},
			},
			temperature: 0,
			seed: 42,
		})

		return result.toTextStreamResponse()
	}

	if (model === 'claude-3-7-sonnet-20250219') {
		const result = streamText({
			model: anthropic(model),
			system: systemPrompt,
			messages,
			temperature: 0,
			seed: 42,
		})

		return result.toTextStreamResponse()
	}

	const result = streamText({
		model: anthropic(model),
		system: systemPrompt,
		messages,
	})

	return result.toTextStreamResponse()
}
