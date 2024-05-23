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

// export async function POST(req: Request) {
// 	const formData = await req.formData()
// 	const messages = JSON.parse(formData.get('messages')!.toString())
// 	const temperature = Number(formData.get('temperature')!)
// 	const topP = Number(formData.get('topP')!)

// 	return new Response(
// 		new ReadableStream({
// 			async start(controller) {
// 				const programStream = await createProgramStream({
// 					messages,
// 					temperature,
// 					topP,
// 				})

// 				let programResult = ''

// 				let startedSending = false
// 				let sentIndex = 0

// 				for await (const chunk of programStream) {
// 					const value = chunk.choices[0]?.delta?.content || ''

// 					programResult += value

// 					if (startedSending) {
// 						const match = programResult.match(/<\/html>/)
// 						if (match) {
// 							controller.enqueue(programResult.slice(sentIndex, match.index! + match[0].length))
// 							break
// 						} else {
// 							controller.enqueue(value)
// 							sentIndex = programResult.length
// 						}
// 					} else {
// 						const match = programResult.match(/<html/)
// 						if (match) {
// 							programResult = '<!DOCTYPE html>\n' + programResult.slice(match.index!)
// 							controller.enqueue(programResult)
// 							sentIndex = programResult.length
// 							startedSending = true
// 						}
// 					}
// 				}
// 				await new Promise((resolve) => setTimeout(resolve, 50))
// 				controller.close()
// 			},
// 		}).pipeThrough(new TextEncoderStream()),
// 		{
// 			headers: {
// 				'Content-Type': 'text/html',
// 			},
// 			status: 200,
// 		}
// 	)
// }

// async function createProgramStream({
// 	messages,
// 	temperature,
// 	topP,
// }: {
// 	messages: any
// 	temperature: number
// 	topP: number
// }) {
// 	const stream = await openai.chat.completions.create({
// 		messages,
// 		model: 'gpt-4o',
// 		temperature,
// 		max_tokens: 4096,
// 		top_p: topP,
// 		stream: true,
// 	})

// 	return stream
// }
