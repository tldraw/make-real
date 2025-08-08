import { createOpenAI } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'

export const maxDuration = 60 // This function can run for a maximum of 5 secondsexport const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const openai = createOpenAI({ apiKey })

	const result1 = generateText({
		model: openai(model),
		system: systemPrompt,
		messages,
		temperature: 0,
		seed: 42,
	})

	console.log(result1.then((r) => r.text))

	const result = streamText({
		model: openai(model),
		system: systemPrompt,
		messages,
		temperature: 0,
		seed: 42,
	})

	return result.toTextStreamResponse()
}
