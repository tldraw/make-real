import { PreviewShape } from '../PreviewShape/PreviewShape'
import { USER_PROMPT, USER_PROMPT_WITH_PREVIOUS_DESIGN } from '../prompt'
import { getContentFromOpenAI } from './actions'

export async function getHtmlFromOpenAI({
	image,
	apiKey,
	text,
	grid,
	theme = 'light',
	previousPreviews,
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
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const messages = [
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[0].content

	// Add the prompt into
	userContent.push({
		type: 'text',
		text: previousPreviews.length > 0 ? USER_PROMPT_WITH_PREVIOUS_DESIGN : USER_PROMPT,
	})

	// Add the image
	userContent.push({
		type: 'image',
		image: image,
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of all the text that we found in the design. Use it as a reference if anything is hard to read in the screenshot(s):\n${text}`,
		})
	}

	if (grid) {
		userContent.push({
			type: 'text',
			text: `The designs have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
		})
	}

	// Add the previous previews as HTML
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
			},
			{
				type: 'image',
				image: preview.props.source,
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

	let json = null

	try {
		const { text } = await getContentFromOpenAI(apiKey, messages)
		json = { choices: [{ message: { content: text } }] }
	} catch (e) {
		throw Error(`Could not contact OpenAI: ${e.message}`)
	}

	return json
}
