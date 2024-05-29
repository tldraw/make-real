import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { streamHtml } from 'openai-html-stream'
import { getScriptToInjectForPreview } from '../../../makereal.tldraw.link/[linkId]/page'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData()

		const messages = JSON.parse(formData.get('messages')!.toString())
		const shapeId = formData.get('shapeId')!.toString()

		// console.log(messages)
		const stream = await openai.chat.completions.create({
			model: 'gpt-4o',
			max_tokens: 4096,
			temperature: 0,
			seed: 42,
			messages,
			stream: true,
			top_p: 0.2,
		})

		console.log('Stream:', shapeId)

		// return the stream!
		return new Response(
			streamHtml(stream, { injectIntoHead: getScriptToInjectForPreview(shapeId) }),
			{
				headers: {
					'Content-Type': 'text/html',
				},
				status: 200,
			}
		)
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
