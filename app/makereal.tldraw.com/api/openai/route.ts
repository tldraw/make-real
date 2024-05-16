import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
	try {
		const res = await req.json()
		const { messages } = res

		const stream = await openai.chat.completions.create({
			model: 'gpt-4o',
			max_tokens: 4096,
			temperature: 0,
			seed: 42,
			messages,
			stream: true,
		})

		// return the stream!
		return new Response(stream.toReadableStream())
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
