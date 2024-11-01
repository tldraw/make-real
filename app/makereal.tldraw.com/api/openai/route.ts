import { createOpenAI } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'

export const maxDuration = 60 // This function can run for a maximum of 5 secondsexport const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const openai = createOpenAI({ apiKey })

	if (model.includes('o1')) {
		console.log('hello')
		const result = await generateText({
			model: openai(model),
			messages: [
				{
					role: 'user',
					content: `Hey, here's a system prompt for you to use: ${systemPrompt}`,
				},
				...messages,
			],
			temperature: 1,
		})
		console.log(result)
		return
	}

	const result = await streamText({
		model: openai(model),
		system: systemPrompt,
		messages,
		maxTokens: 4096,
		temperature: 0,
		seed: 42,
	})
	return result.toTextStreamResponse()
}
