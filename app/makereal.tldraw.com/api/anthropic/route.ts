import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { OPEN_AI_SYSTEM_PROMPT } from '../../../prompt'

export async function POST(req: NextRequest) {
	try {
		const res = await req.json()
		const { userContent } = res

		const anthropic = new Anthropic({
			apiKey: process.env.ANTHROPIC_API_KEY,
		})

		const msg = await anthropic.messages.create({
			model: 'claude-3-opus-20240229',
			max_tokens: 4000,
			temperature: 0,
			system: OPEN_AI_SYSTEM_PROMPT,
			messages: [
				{
					role: 'user',
					content: userContent,
				},
			],
		})

		return Response.json(msg)
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
