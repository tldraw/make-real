import { Editor, createShapeId, getSvgAsImage } from 'tldraw'
import { ComponentShape } from '../ComponentShape/ComponentShape'
import { blobToBase64 } from './blobToBase64'
import { getComponentFromOpenAI } from './getComponentFromOpenAI'
import { getSelectionAsText } from './getSelectionAsText'

export async function makeAppear(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the component shape
	const selectionBox = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<ComponentShape>({
		id: newShapeId,
		type: 'component',
		x: selectionBox.maxX + 60, // to the right of the selection
		y: selectionBox.minY,
		props: { w: selectionBox.width, h: selectionBox.height },
	})

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvgString(selectedShapes, {
		scale: 1,
		background: true,
	})

	const bigSvg = await editor.getSvgString(selectedShapes, {
		scale: 1,
		background: false,
		// padding: 0,
	})

	// Add the grid lines to the SVG
	// const grid = { color: 'red', size: 100, labels: true }
	// addGridToSvg(svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg.svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 1,
		width: svg.width,
		height: svg.height,
	})
	const dataUrl = await blobToBase64(blob!)
	const bigBlob = await getSvgAsImage(bigSvg.svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 2,
		width: bigSvg.width,
		height: bigSvg.height,
	})
	const bigDataUrl = await blobToBase64(bigBlob!)
	editor.updateShape<ComponentShape>({
		id: newShapeId,
		type: 'component',
		props: {
			image: bigDataUrl,
			imageW: bigSvg.width,
			imageH: bigSvg.height,
		},
	})
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
		const json = await getComponentFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			components: getSelectionAsComponentCode(editor),
			// previousPreviews,
			// grid,
			// theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		// Extract the HTML from the response
		const message = json.choices[0].message.content

		console.log('RESPONSE', message)

		// Extract the HTML from the response
		let codeBlock = message.split('```')[1]
		if (codeBlock.startsWith('html')) {
			codeBlock = codeBlock.slice('html'.length)
		}

		const html = codeBlock.trim()

		console.log('SANITISED', html)

		// console.log(message)
		// const start = message.indexOf('<!DOCTYPE html>')
		// const end = message.indexOf('</html>')
		// const html = message.slice(start, end + '</html>'.length)

		// // No HTML? Something went wrong
		// if (html.length < 100) {
		// 	console.warn(message)
		// 	throw Error('Could not generate a design from those wireframes.')
		// }

		// Upload the HTML / link for the shape
		// await uploadLink(newShapeId, html)

		// Update the shape with the new props
		editor.updateShape<ComponentShape>({
			id: newShapeId,
			type: 'component',
			props: {
				source: html,
			},
		})
	} catch (e) {
		// If anything went wrong, delete the shape.
		// editor.deleteShape(newShapeId)
		throw e
	}
}

function getSelectionAsComponentCode(editor: Editor) {
	const selectedShapes = editor.getSelectedShapes()

	return selectedShapes
		.map((shape) => {
			if (shape.type === 'component') {
				return shape.props['source']
			}
			return null
		})
		.filter((source) => source !== null)
		.join('\n')
}
