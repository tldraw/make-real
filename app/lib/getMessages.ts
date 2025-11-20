import { CoreUserMessage, UserContent } from 'ai'
import { PreviewShape } from '../PreviewShape/PreviewShape'

export function getMessages({
	image,
	text,
	grid,
	theme = 'light',
	previousPreviews,
	prompts,
}: {
	image: string
	text?: string
	theme?: string
	grid?: {
		color: string
		size: number
		labels: boolean
	}
	prompts: {
		system: string
		user: (sourceCode: string) => string
	}
	previousPreviews?: PreviewShape[]
}) {
	const messages: CoreUserMessage[] = [
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[0].content as Exclude<UserContent, string>

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
	if (previousPreviews.length > 0) {
		// Add the previous previews as HTML
		for (let i = 0; i < previousPreviews.length; i++) {
			const preview = previousPreviews[i]
			userContent.push(
				{
					type: 'text',
					text: prompts.user(preview.props.html),
				}
				// {
				// 	type: 'image',
				// 	image: preview.props.source,
				// }
			)
		}
	} else {
		userContent.push({
			type: 'text',
			text: prompts.user(''),
		})
	}

	return messages
}
