import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { streamHtml } from 'openai-html-stream'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData()

		const messages = JSON.parse(formData.get('messages')!.toString())

		// console.log(messages)
		const stream = await openai.chat.completions.create({
			model: 'gpt-4o',
			max_tokens: 4096,
			temperature: 0,
			seed: 42,
			messages,
			stream: true,
		})

		// return the stream!
		return new Response(streamHtml(stream), {
			headers: {
				'Content-Type': 'text/html',
			},
			status: 200,
		})
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
