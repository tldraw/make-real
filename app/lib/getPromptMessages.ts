import { PreviewShape } from '../PreviewShape/PreviewShape'
import {
	OPENAI_USER_PROMPT,
	OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN,
	OPEN_AI_SYSTEM_PROMPT,
} from '../prompt'

export function getPromptMessages({
	image,
	text,
	theme = 'light',
	previousPreviews,
}: {
	image: string
	text: string
	theme?: string

	previousPreviews?: PreviewShape[]
}) {
	const messages: GPT4VCompletionRequest['messages'] = [
		{
			role: 'system',
			content: OPEN_AI_SYSTEM_PROMPT,
		},
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[1].content as Exclude<MessageContent, string>

	// Add the prompt into
	userContent.push({
		type: 'text',
		text:
			previousPreviews.length > 0 ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT,
	})

	// Add the image
	userContent.push({
		type: 'image_url',
		image_url: {
			url: image,
			detail: 'high',
		},
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of all the text that we found in the design. Use it as a reference if anything is hard to read in the screenshot(s):\n${text}`,
		})
	}

	// Add the previous previews as HTML
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		console.log('preview', preview.props.html)
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
			},
			{
				type: 'image_url',
				image_url: {
					url: preview.props.source,
					detail: 'high',
				},
			},
			{
				type: 'text',
				text: `And here's the HTML you came up with for it: ${preview.props.html}`,
			}
		)
	}

	// Prompt the theme
	userContent.push({
		type: 'text',
		text: `Please make your result use the ${theme} theme.`,
	})

	return messages
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
	model: 'gpt-4o'
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
