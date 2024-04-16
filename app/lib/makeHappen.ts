import { Editor, TLTextShape, createShapeId, getSvgAsImage } from 'tldraw'
import { blobToBase64 } from './blobToBase64'
import { getSelectionAsText } from './getSelectionAsText'
import { getTextFromOpenAI } from './getTextFromOpenAI'

const WIDTH = 1200

export async function makeHappen(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY, minY } = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<TLTextShape>({
		id: newShapeId,
		type: 'text',
		x: maxX + 60, // to the right of the selection
		y: minY,
		props: {
			text: '...',
			font: 'mono',
			size: 'l',
			align: 'start',
			color: 'black',
			autoSize: false,
			w: WIDTH,
		},
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
	// const previousPreviews = selectedShapes.filter((shape) => {
	// 	return shape.type === 'preview'
	// }) as PreviewShape[]

	// if (previousPreviews.length > 0) {
	// 	track('repeat_make_real', { timestamp: Date.now() })
	// }

	// Send everything to OpenAI and get some HTML back
	try {
		const json = await getTextFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			// grid,
		})

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		let message = json.choices[0].message.content
		console.log(`Response: ${message}`)

		if (message.slice(0, 3) === '```') {
			message = message.replace(/```\w*\n/, '')
		}

		message = message.replaceAll('```', '')

		// Update the shape with the new props
		editor.updateShape<TLTextShape>({
			id: newShapeId,
			type: 'text',
			props: {
				text: message,
				autoSize: false,
				w: WIDTH,
			},
		})
	} catch (e) {
		// If anything went wrong, delete the shape.
		editor.deleteShape(newShapeId)
		throw e
	}
}
