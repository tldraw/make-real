/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from 'react'
import { BaseBoxShapeUtil, DefaultSpinner, HTMLContainer, TLBaseShape, Vec } from 'tldraw'

export type ComponentShape = TLBaseShape<
	'component',
	{
		source: string
		w: number
		h: number
		image: string
		imageW: number
		imageH: number
	}
>

export class ComponentShapeUtil extends BaseBoxShapeUtil<ComponentShape> {
	static override type = 'component' as const

	getDefaultProps(): ComponentShape['props'] {
		return {
			source: '',
			w: 100,
			h: 100,
			image: '',
			imageW: 100,
			imageH: 100,
		}
	}

	// override onClick = (shape: ComponentShape) => {}

	override canEdit = () => false
	override isAspectRatioLocked = (_shape: ComponentShape) => false
	override canResize = (_shape: ComponentShape) => true
	override canBind = (_shape: ComponentShape) => false

	override component(shape: ComponentShape) {
		const divRef = useRef<HTMLDivElement>(null)
		// Update the div with source
		useEffect(() => {
			if (!divRef.current) return
			if (divRef.current.innerHTML === shape.props.source) return
			divRef.current.innerHTML = shape.props.source
			const divWidth = divRef.current.clientWidth
			const divHeight = divRef.current.clientHeight
			// this.editor.updateShape({
			// 	type: 'component',
			// 	id: shape.id,
			// 	props: {
			// 		w: divWidth,
			// 		h: divHeight,
			// 	},
			// })
		}, [shape.props.source, shape.id])

		return (
			<HTMLContainer
				className="tl-embed-container"
				id={shape.id}
				style={{ border: '1px solid #0000001f' }}
			>
				<div
					className="component-shape-div"
					style={
						{
							// backgroundColor: 'var(--color-culled)',
							// width: 'fit-content',
							// height: 'fit-content',
							// display: 'flex',
							// flexDirection: 'column',
							// height: '100%',
							// justifyContent: 'center',
							// alignItems: 'center',
						}
					}
					onPointerDown={(e) => {
						e.stopPropagation()
					}}
					ref={divRef}
				></div>
				{!shape.props.source && (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-culled)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							// boxShadow,
							border: '1px solid var(--color-panel-contrast)',
							borderRadius: 'var(--radius-2)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
			</HTMLContainer>
		)
	}

	override toSvg(shape: ComponentShape) {
		const imageUrl = shape.props.image
		if (!imageUrl) return null

		const widthDiff = shape.props.w - shape.props.imageW
		const heightDiff = shape.props.h - shape.props.imageH
		const x = widthDiff / 2
		const y = heightDiff / 2
		return (
			<image href={imageUrl} width={shape.props.imageW} height={shape.props.imageH} x={x} y={y} />
		)
	}

	indicator(shape: ComponentShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

// todo: export these from tldraw

const ROTATING_BOX_SHADOWS = [
	{
		offsetX: 0,
		offsetY: 2,
		blur: 4,
		spread: -1,
		color: '#0000003a',
	},
	{
		offsetX: 0,
		offsetY: 3,
		blur: 12,
		spread: -2,
		color: '#0000001f',
	},
]

export function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}
