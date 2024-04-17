import { VertexAI } from '@google-cloud/vertexai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const res = await req.json()
		const { userContent } = res
		const vertexAI = new VertexAI({
			project: 'turnkey-energy-420515',
			location: 'europe-west2',
			googleAuthOptions: {
				credentials: {
					client_email: process.env.GOOGLE_CLIENT_EMAIL,
					private_key: process.env.GOOGLE_PRIVATE_KEY,
				},
			},
		})
		// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)

		const generativeVisionModel = vertexAI.getGenerativeModel({ model: 'gemini-pro-vision' })

		const textPart = {
			text: 'hello',
		}

		const request = {
			contents: [{ role: 'user', parts: [textPart] }],
		}

		const responseStream = await generativeVisionModel.generateContentStream(request)
		// const aggregatedResponse = await responseStream.response
		// const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text

		// console.log(fullTextResponse)

		return Response.json({ message: vertexAI })

		// const result = await model.generateContent([OPEN_AI_SYSTEM_PROMPT, ...userContent])
		// const response = await result.response
		// const text = response.text()
		// console.log(text)

		// const msg = await anthropic.messages.create({
		// 	model: 'claude-3-opus-20240229',
		// 	max_tokens: 4000,
		// 	temperature: 0,
		// 	system: OPEN_AI_SYSTEM_PROMPT,
		// 	messages: [
		// 		{
		// 			role: 'user',
		// 			content: userContent,
		// 		},
		// 	],
		// })

		// return Response.json(text)
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
