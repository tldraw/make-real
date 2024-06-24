import { PreviewShape } from '../PreviewShape/PreviewShape'
import { USER_PROMPT } from '../prompt'
import { getContentFromAnthropic } from './actions'

export async function getHtmlFromAnthropic({
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

	// Add the image
	userContent.push({
		type: 'image',
		image: image,
	})

	// Add the prompt
	userContent.push({
		type: 'text',
		text: `${USER_PROMPT} Please make your result use the ${theme} theme.`,
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

	if (previousPreviews.length > 0) {
		userContent.push({
			type: 'text',
			text: 'The designs also included one of your previous results.',
		})
		// Add the previous previews as HTML
		for (let i = 0; i < previousPreviews.length; i++) {
			const preview = previousPreviews[i]
			userContent.push(
				{
					type: 'image',
					image: preview.props.source,
				},
				{
					type: 'text',
					text: `Here's the HTML you came up with for this one:\n\n${preview.props.html}`,
				}
			)
		}

		userContent.push({
			type: 'text',
			text: `Please use these previous results as references when creating your new prototype. Rather than starting from scratch, use these previous results as a starting point.`,
		})
	}

	let json = null

	try {
		const { text } = await getContentFromAnthropic(apiKey, messages)
		json = { choices: [{ message: { content: text } }] }
	} catch (e) {
		throw Error(`Could not contact OpenAI: ${e.message}`)
	}

	return json
}
