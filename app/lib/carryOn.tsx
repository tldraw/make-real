import { Editor, TLGeoShape, TLShape, useEditor } from 'tldraw'

async function carryOn(editor: Editor) {
	const shapes = editor.getCurrentPageShapes()
	const easyXmlShapes = shapesToEasyXml(shapes)
	console.log(easyXmlShapes)

	const response = await fetch('/api/anthropic', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			system:
				"Your job is to predict what the user will draw next. You are given the list of shapes that the user has already drawn, in order from oldest to newest. Based on the pattern, what comes next? Respond with the same format as you received, but only include the next shape(s). In this limited version of the app, you only have access to the 'rectangle' shape.",
			messages: [
				{
					role: 'user',
					content: easyXmlShapes,
				},
				{
					role: 'assistant',
					content: '<',
				},
			],
		}),
	})

	const data = await response.json()
	const returnedEasyXmlShapes = '<' + data.content[0].text
	console.log(returnedEasyXmlShapes)

	const shapesToCreate = easyXmlToShapes(returnedEasyXmlShapes)
	editor.createShapes(shapesToCreate)
}

function easyXmlToShapes(easyXml: string) {
	const easyJsonShapes = easyXmlToEasyJson(easyXml)
	return easyJsonToShapes(easyJsonShapes)
}

type EasyJsonShape = {
	type: string
	[key: string]: string
}

function easyJsonToShapes(easyJson: EasyJsonShape[]) {
	return easyJson.map((shape) => easyJsonToShape(shape))
}

function easyJsonToShape(shape: EasyJsonShape) {
	switch (shape.type) {
		case 'rectangle': {
			return {
				type: 'geo',
				x: parseInt(shape.x),
				y: parseInt(shape.y),
				props: {
					w: parseInt(shape.width),
					h: parseInt(shape.height),
					geo: 'rectangle',
				},
			}
		}
	}

	throw Error('Unrecognized shape type')
}

function easyXmlToEasyJson(easyXml: string) {
	const parser = new DOMParser()
	const doc = parser.parseFromString(easyXml, 'text/xml')
	return Array.from(doc.children).map((child) => {
		const shape = {
			type: child.tagName,
			...Object.fromEntries(Array.from(child.attributes).map((attr) => [attr.name, attr.value])),
		}
		return shape
	})
}

function shapesToEasyXml(shapes: TLShape[]) {
	return shapes.map(shapeToEasyXml).join('\n')
}

function shapeToEasyXml(shape: TLShape) {
	switch (shape.type) {
		case 'geo': {
			return geoShapeToEasyXml(shape as TLGeoShape)
		}
	}
}

function geoShapeToEasyXml(shape: TLGeoShape) {
	const x = shape.x.toFixed(0)
	const y = shape.y.toFixed(0)
	const width = shape.props.w.toFixed(0)
	const height = shape.props.h.toFixed(0)

	switch (shape.props.geo) {
		case 'rectangle': {
			return `<rectangle x="${x}" y="${y}" width="${width}" height="${height}"></rectangle>`
		}
	}

	throw Error('Unrecognized geo shape type')
}

export function CarryOnButton() {
	const editor = useEditor()
	return (
		<button
			onClick={() => carryOn(editor)}
			className="p-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			<div
				style={{
					borderRadius: 'var(--radius-2)',
					boxShadow: 'var(--shadow-2)',
					color: 'var(--color-text)',
					fontWeight: 'bold',
				}}
				className="py-2 px-4 bg-[var(--color-panel)] hover:bg-[var(--color-low)] rounded"
			>
				Carry On
			</div>
		</button>
	)
}
