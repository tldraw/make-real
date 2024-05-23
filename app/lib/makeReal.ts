import { track } from '@vercel/analytics/react'
import { Editor, TLShapeId, createShapeId, getSvgAsImage } from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { PreviewShapeRaw } from '../PreviewShapeRaw/PreviewShapeRaw'
import { blobToBase64 } from './blobToBase64'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { getSelectionAsText } from './getSelectionAsText'

export async function makeReal(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<PreviewShapeRaw>({
		id: newShapeId,
		type: 'preview-raw',
		x: maxX + 60, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { html: '', source: '' },
	})

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvgString(selectedShapes, {
		scale: 1,
		background: true,
	})

	// Add the grid lines to the SVG
	// const grid = { color: 'red', size: 100, labels: true }
	// addGridToSvg(svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg.svg, IS_SAFARI, {
		type: 'png',
		quality: 0.8,
		scale: 1,
		width: svg.width,
		height: svg.height,
	})
	const dataUrl = await blobToBase64(blob!)
	// downloadDataURLAsFile(dataUrl, 'tldraw.png')

	// Get any previous previews among the selected shapes
	const previousPreviews = selectedShapes.filter((shape) => {
		return shape.type === 'preview'
	}) as PreviewShape[]

	if (previousPreviews.length > 0) {
		track('repeat_make_real', { timestamp: Date.now() })
	}

	// Send everything to OpenAI and get some HTML back
	try {
		const response = await getHtmlFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			previousPreviews,
			// grid,
			theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (!response) {
			throw Error('Could not contact OpenAI.')
		}

		// if (json?.error) {
		// 	throw Error(`${json.error.message?.slice(0, 128)}...`)
		// }

		// console.log('stream', response)
		const stream = response.body as ReadableStream
		const reader = stream.getReader()

		let message = ''
		let done = false
		while (!done) {
			const { value, done: _done } = await reader.read()
			done = _done
			if (value) {
				const snippet = new TextDecoder()
					.decode(value)
					.split('\n')
					.filter((s) => s.length > 0)
					.map((s) => JSON.parse(s).choices[0].delta.content)
					.join('')
				message += snippet
				updateShapeWithMessage({
					editor,
					id: newShapeId,
					message,
				})
			}
		}

		editor.updateShape<PreviewShapeRaw>({
			id: newShapeId,
			type: 'preview-raw',
			props: {
				isFinishedStreaming: true,
			},
		})

		// console.log(`Response: ${message}`)
	} catch (e) {
		// If anything went wrong, delete the shape.
		editor.deleteShape(newShapeId)
		throw e
	}
}

function updateShapeWithMessage({
	editor,
	id,
	message,
}: {
	editor: Editor
	id: TLShapeId
	message: string
}) {
	// Extract the HTML from the response
	const startIndex = message.indexOf('<!DOCTYPE html>')
	const endIndex = message.indexOf('</html>')
	const start = startIndex === -1 ? 0 : startIndex
	const end = endIndex === -1 ? message.length : endIndex + '</html>'.length
	const html = message.slice(start, end)

	// console.log(message)

	// No HTML? Something went wrong
	// if (html.length < 100) {
	// 	console.warn(message)
	// 	throw Error('Could not generate a design from those wireframes.')
	// }

	// Upload the HTML / link for the shape
	// await uploadLink(id, html)

	// Update the shape with the new props
	editor.updateShape<PreviewShapeRaw>({
		id,
		type: 'preview-raw',
		props: {
			html,
		},
	})
}
