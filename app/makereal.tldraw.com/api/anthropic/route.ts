import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const res = await req.json()
		const {
			// model = 'claude-3-opus-20240229',
			model = 'claude-3-haiku-20240307',
			max_tokens = 4096,
			temperature = 0,
			system,
			messages = [],
		} = res

		const anthropic = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		})

		const msg = await anthropic.messages.create({
			model,
			max_tokens,
			temperature,
			system,
			messages,
		})

		return Response.json(msg)
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
