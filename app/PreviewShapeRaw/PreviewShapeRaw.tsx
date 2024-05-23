/* eslint-disable react-hooks/rules-of-hooks */
import { ReactElement, forwardRef, useEffect, useRef, useState } from 'react'
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	SvgExportContext,
	TLBaseShape,
	TldrawUiIcon,
	Vec,
	toDomPrecision,
	useIsEditing,
	useValue,
} from 'tldraw'
import { Dropdown } from '../components/Dropdown'
import { LINK_HOST, PROTOCOL } from '../lib/hosts'
import { getSandboxPermissions } from '../lib/iframe'

export type PreviewShapeRaw = TLBaseShape<
	'preview-raw',
	{
		html: string
		source: string
		w: number
		h: number
		dateCreated?: number
		isFinishedStreaming?: boolean
	}
>

export class PreviewShapeRawUtil extends BaseBoxShapeUtil<PreviewShapeRaw> {
	static override type = 'preview-raw' as const

	getDefaultProps(): PreviewShapeRaw['props'] {
		return {
			html: '',
			source: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
			dateCreated: Date.now(),
			isFinishedStreaming: false,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShapeRaw) => false
	override canResize = (_shape: PreviewShapeRaw) => true
	override canBind = (_shape: PreviewShapeRaw) => false

	override component(shape: PreviewShapeRaw) {
		const isEditing = useIsEditing(shape.id)

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		const { html } = shape.props

		// // upload the html if we haven't already:
		// useEffect(() => {
		// 	let isCancelled = false
		// 	if (html && (linkUploadVersion === undefined || uploadedShapeId !== shape.id)) {
		// 		;(async () => {
		// 			await uploadLink(shape.id, html)
		// 			if (isCancelled) return

		// 			this.editor.updateShape<PreviewShapeRaw>({
		// 				id: shape.id,
		// 				type: 'preview-raw',
		// 				props: {
		// 					linkUploadVersion: 1,
		// 					uploadedShapeId: shape.id,
		// 				},
		// 			})
		// 		})()
		// 	}
		// 	return () => {
		// 		isCancelled = true
		// 	}
		// }, [shape.id, html, linkUploadVersion, uploadedShapeId])

		// const isLoading = linkUploadVersion === undefined || uploadedShapeId !== shape.id
		const isLoading = html === ''

		const uploadUrl = [PROTOCOL, LINK_HOST, '/', shape.id.replace(/^shape:/, '')].join('')

		const iframeRefA = useRef<HTMLIFrameElement>(null)
		const iframeRefB = useRef<HTMLIFrameElement>(null)

		const [iframeAIsLoaded, setIframeAIsLoaded] = useState(true)
		const [iframeBIsLoaded, setIframeBIsLoaded] = useState(true)
		const [activeIframe, setActiveIframe] = useState<'a' | 'b'>('a')

		useEffect(() => {
			const nextIframe = activeIframe === 'a' ? 'b' : 'a'
			const nextIframeRef = nextIframe === 'a' ? iframeRefA : iframeRefB
			const nextIframeIsDirty = nextIframeRef.current?.srcdoc !== html
			if (!nextIframeIsDirty) {
				return
			}
			// console.log('dirty', nextIframe)
			const nextIframeIsLoaded = nextIframe === 'a' ? iframeAIsLoaded : iframeBIsLoaded
			if (!nextIframeIsLoaded) {
				// console.log('not loaded', nextIframe)
				return
			}
			if (nextIframeRef.current === null) {
				return
			}
			// console.log('updating', nextIframe)
			nextIframeRef.current.srcdoc = html
			nextIframe === 'a' ? setIframeAIsLoaded(false) : setIframeBIsLoaded(false)
		}, [shape.props.html, activeIframe, iframeAIsLoaded, iframeBIsLoaded, html])

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{isLoading ? (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-culled)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow,
							border: '1px solid var(--color-panel-contrast)',
							borderRadius: 'var(--radius-2)',
						}}
					>
						<DefaultSpinner />
					</div>
				) : (
					<>
						<IFrame
							// srcDoc={html}
							ref={iframeRefA}
							shape={shape}
							hidden={activeIframe === 'b'}
							isEditing={isEditing}
							boxShadow={boxShadow}
							loadCallback={() => {
								setIframeAIsLoaded(true)
								setActiveIframe('a')
							}}
						/>
						<IFrame
							// srcDoc={html}
							ref={iframeRefB}
							shape={shape}
							hidden={activeIframe === 'a'}
							isEditing={isEditing}
							boxShadow={boxShadow}
							loadCallback={() => {
								setIframeBIsLoaded(true)
								setActiveIframe('b')
							}}
						/>
						<div
							style={{
								all: 'unset',
								position: 'absolute',
								top: -3,
								right: -45,
								height: 40,
								width: 40,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								pointerEvents: 'all',
							}}
						>
							<Dropdown boxShadow={boxShadow} html={shape.props.html} uploadUrl={uploadUrl}>
								<button className="bg-white rounded p-2" style={{ boxShadow }}>
									<TldrawUiIcon icon="dots-vertical" />
								</button>
							</Dropdown>
						</div>
						<div
							style={{
								textAlign: 'center',
								position: 'absolute',
								bottom: isEditing ? -40 : 0,
								padding: 4,
								fontFamily: 'inherit',
								fontSize: 12,
								left: 0,
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								pointerEvents: 'none',
							}}
						>
							<span
								style={{
									background: 'var(--color-panel)',
									padding: '4px 12px',
									borderRadius: 99,
									border: '1px solid var(--color-muted-1)',
								}}
							>
								{shape.props.isFinishedStreaming
									? isEditing
										? 'Click the canvas to exit'
										: 'Double click to interact'
									: 'Loading...'}
							</span>
						</div>
					</>
				)}
			</HTMLContainer>
		)
	}

	override toSvg(shape: PreviewShapeRaw, _ctx: SvgExportContext): Promise<ReactElement> {
		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		// while screenshot is the same as the old one, keep waiting for a new one
		return new Promise((resolve, _) => {
			if (window === undefined) return resolve(<g></g>)
			const windowListener = (event: MessageEvent) => {
				if (event.data.screenshot && event.data?.shapeid === shape.id) {
					window.removeEventListener('message', windowListener)
					clearTimeout(timeOut)
					resolve(
						<g>
							<image
								href={event.data.screenshot}
								width={shape.props.w}
								height={shape.props.h}
							></image>
						</g>
					)
				}
			}
			const timeOut = setTimeout(() => {
				resolve(<g></g>)
				window.removeEventListener('message', windowListener)
			}, 2000)
			window.addEventListener('message', windowListener)
			//request new screenshot
			const firstLevelIframe = document.getElementById(`iframe-1-${shape.id}`) as HTMLIFrameElement
			if (firstLevelIframe) {
				firstLevelIframe.contentWindow.postMessage(
					{ action: 'take-screenshot', shapeid: shape.id },
					'*'
				)
			} else {
				console.log('first level iframe not found or not accessible')
			}
		})
	}

	indicator(shape: PreviewShapeRaw) {
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

const IFrame = forwardRef<
	HTMLIFrameElement,
	{
		shape: PreviewShapeRaw
		hidden: boolean
		isEditing: boolean
		boxShadow: string
		loadCallback?: () => void
	}
>(function IFrame(
	{
		shape,
		hidden,
		isEditing,
		boxShadow,
		loadCallback,
	}: {
		isEditing: boolean
		shape: PreviewShapeRaw
		hidden: boolean
		boxShadow: string
		loadCallback?: () => void
	},
	ref
) {
	return (
		<iframe
			id={`iframe-1-${shape.id}`}
			// srcDoc={srcDoc}
			// src={`${uploadUrl}?preview=1&v=${linkUploadVersion}`}
			width={toDomPrecision(shape.props.w)}
			height={toDomPrecision(shape.props.h)}
			draggable={false}
			style={{
				backgroundColor: 'var(--color-panel)',
				pointerEvents: isEditing ? 'auto' : 'none',
				boxShadow,
				border: '1px solid var(--color-panel-contrast)',
				borderRadius: 'var(--radius-2)',
				display: hidden ? 'none' : 'block',
			}}
			ref={ref}
			onLoad={loadCallback}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			sandbox={getSandboxPermissions({
				'allow-downloads-without-user-activation': false,
				'allow-downloads': true,
				'allow-modals': true,
				'allow-orientation-lock': false,
				'allow-pointer-lock': true,
				'allow-popups': true,
				'allow-popups-to-escape-sandbox': true,
				'allow-presentation': true,
				'allow-storage-access-by-user-activation': true,
				'allow-top-navigation': true,
				'allow-top-navigation-by-user-activation': true,
				'allow-scripts': true,
				'allow-same-origin': true,
				'allow-forms': true,
			})}
		/>
	)
})
