import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const openai = createOpenAI({ apiKey })

	if (model.startsWith('gpt-5')) {
		const result = streamText({
			model: openai.responses('gpt-5'),
			system: systemPrompt,
			messages,
			temperature: 0,
		})

		return result.toTextStreamResponse()
	}

	const result = streamText({
		model: openai(model),
		system: systemPrompt,
		messages,
		temperature: 0,
		seed: 42,
	})

	return result.toTextStreamResponse()
}
