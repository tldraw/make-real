import { PreviewShape } from '../PreviewShape/PreviewShape'
import { OPENAI_USER_PROMPT } from '../prompt'

export async function getHtmlFromAnthropic({
	image,
	apiKey,
	text,
	grid,
	theme = 'light',
	previousPreviews,
	model,
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	grid?: {
		color: string
		size: number
		labels: boolean
	}
	previousPreviews?: PreviewShape[]
	model: string
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const userContent = [] as any

	// Add the prompt into
	userContent.push({
		type: 'text',
		text: OPENAI_USER_PROMPT,
		// previousPreviews.length > 0 ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT,
	})

	// console.log(image)

	// Add the image
	userContent.push({
		type: 'image',
		source: {
			type: 'base64',
			media_type: 'image/png',
			data: image.slice('data:image/png;base64,'.length),
		},
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of text that we found in the design:\n${text}`,
		})
	}

	if (grid) {
		userContent.push({
			type: 'text',
			text: `The designs have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
		})
	}

	// Add the previous previews as HTML
	// for (let i = 0; i < previousPreviews.length; i++) {
	// 	const preview = previousPreviews[i]
	// 	userContent.push(
	// 		{
	// 			type: 'text',
	// 			text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
	// 		},
	// 		{
	// 			// type: 'image_url',
	// 			// image_url: {
	// 			// 	url: preview.props.source,
	// 			// 	detail: 'high',
	// 			// },
	// 			type: 'image',
	// 			source: {
	// 				type: 'base64',
	// 				media_type: 'image/jpeg',
	// 				data: preview.props.source,
	// 			},
	// 		},
	// 		{
	// 			type: 'text',
	// 			text: `And here's the HTML you came up with for it: ${preview.props.html}`,
	// 		}
	// 	)
	// }

	// Prompt the theme
	userContent.push({
		type: 'text',
		text: `Please make your result use the ${theme} theme.`,
	})

	// console.log(userContent)

	const response = await fetch('/api/anthropic', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			userContent,
			model,
		}),
	})

	return await response.json()

	// console.log(await response.json())

	// console.log(userContent)

	// const params: Anthropic.MessageCreateParams = {
	// 	max_tokens: 1000,
	// 	messages: [{ role: 'user', content: 'Hello, Claude' }],
	// 	model: 'claude-3-opus-20240229',
	// }
	// const message: Anthropic.Message = await anthropic.messages.create(params)

	// const resp = await fetch('https://api.anthropic.com/v1/messages', {
	// 	method: 'POST',
	// 	headers: {
	// 		'content-type': 'application/json',
	// 		'x-api-key': apiKey,
	// 	},
	// 	body: JSON.stringify(params),
	// 	// mode: 'no-cors',
	// })

	// console.log(resp)

	// const body: GPT4VCompletionRequest = {
	// 	model: 'gpt-4-turbo',
	// 	max_tokens: 4096,
	// 	temperature: 0,
	// 	messages,
	// 	seed: 42,
	// 	n: 1,
	// }

	// let json = null

	// try {
	// 	const resp = await fetch('https://api.openai.com/v1/chat/completions', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: `Bearer ${apiKey}`,
	// 		},
	// 		body: JSON.stringify(body),
	// 	})
	// 	json = await resp.json()
	// } catch (e) {
	// 	throw Error(`Could not contact OpenAI: ${e.message}`)
	// }

	// return json
}

type MessageContent =
	| string
	| (
			| string
			| {
					type: 'image_url'
					image_url:
						| string
						| {
								url: string
								detail: 'low' | 'high' | 'auto'
						  }
			  }
			| {
					type: 'text'
					text: string
			  }
	  )[]

export type GPT4VCompletionRequest = {
	model: 'gpt-4-turbo'
	messages: {
		role: 'system' | 'user' | 'assistant' | 'function'
		content: MessageContent
		name?: string | undefined
	}[]
	functions?: any[] | undefined
	function_call?: any | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	seed?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
