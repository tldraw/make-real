import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 60 // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const { apiKey, messages, model, systemPrompt } = await req.json()
	const google = createGoogleGenerativeAI({ apiKey })

	const result = streamText({
		model: google(model),
		system: systemPrompt,
		messages,
		temperature: 0,
		seed: 42,
	})

	return result.toTextStreamResponse()
}
