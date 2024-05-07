import { track } from '@vercel/analytics/react'
import { Editor, createShapeId, getSvgAsImage } from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { blobToBase64 } from './blobToBase64'
import { getHtmlFromAnthropic } from './getHtmlFromAnthropic'
import { getSelectionAsText } from './getSelectionAsText'
import { uploadLink } from './uploadLink'

export async function makeRealAnthropic(editor: Editor, apiKey: string, model: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<PreviewShape>({
		id: newShapeId,
		type: 'preview',
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
		const json = await getHtmlFromAnthropic({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			previousPreviews,
			// grid,
			theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
			model,
		})

		if (!json) {
			throw Error('Could not contact Anthropic.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		// Extract the HTML from the response
		console.log(json)
		const message = json.content[0].text
		const start = message.indexOf('<!DOCTYPE html>')
		const end = message.indexOf('</html>')
		const html = message.slice(start, end + '</html>'.length)

		// No HTML? Something went wrong
		if (html.length < 100) {
			console.warn(message)
			throw Error('Could not generate a design from those wireframes.')
		}

		// Upload the HTML / link for the shape
		await uploadLink(newShapeId, html)

		// Update the shape with the new props
		editor.updateShape<PreviewShape>({
			id: newShapeId,
			type: 'preview',
			props: {
				html,
				source: dataUrl as string,
				linkUploadVersion: 1,
				uploadedShapeId: newShapeId,
			},
		})

		console.log(`Response: ${message}`)
	} catch (e) {
		// If anything went wrong, delete the shape.
		editor.deleteShape(newShapeId)
		throw e
	}
}
