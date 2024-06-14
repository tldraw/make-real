/* eslint-disable react-hooks/rules-of-hooks */
import { ReactElement, useEffect, useRef, useState } from 'react'
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
import { uploadLink } from '../lib/uploadLink'
import { getScriptToInjectForPreview } from '../makereal.tldraw.link/[linkId]/page'

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		source: string
		w: number
		h: number
		messages: any[]
		linkUploadVersion?: number
		uploadedShapeId?: string
		dateCreated?: number
	}
>

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			source: '',
			messages: [],
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
			dateCreated: Date.now(),
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		const { html, linkUploadVersion, uploadedShapeId } = shape.props

		// upload the html if we haven't already:
		useEffect(() => {
			let isCancelled = false
			if (html && (linkUploadVersion === undefined || uploadedShapeId !== shape.id)) {
				;(async () => {
					await uploadLink(shape.id, html)
					if (isCancelled) return

					this.editor.updateShape<PreviewShape>({
						id: shape.id,
						type: 'preview',
						props: {
							linkUploadVersion: 1,
							uploadedShapeId: shape.id,
						},
					})
				})()
			}
			return () => {
				isCancelled = true
			}
		}, [shape.id, html, linkUploadVersion, uploadedShapeId])

		const [hasStreamingStarted, setHasStreamingStarted] = useState(false)
		let derivedStreamingStage = 'loading'
		if (shape.props.messages.length !== 0) {
			derivedStreamingStage = 'requesting'
		}
		if (hasStreamingStarted) {
			derivedStreamingStage = 'streaming'
		}
		if (linkUploadVersion !== undefined && uploadedShapeId === shape.id) {
			derivedStreamingStage = 'uploaded'
		}

		const uploadUrl = [PROTOCOL, LINK_HOST, '/', shape.id.replace(/^shape:/, '')].join('')
		const formRef = useRef<HTMLFormElement>(null)
		const iframeRef = useRef<HTMLIFrameElement>(null)
		useEffect(() => {
			if (derivedStreamingStage === 'requesting') {
				// console.log(shape.props.messages)
				// console.log(JSON.stringify(shape.props.messages))
				formRef.current.submit()
				setHasStreamingStarted(true)
			}
		}, [derivedStreamingStage, shape.props.messages])

		const iframeHtmlElement = iframeRef.current?.contentWindow?.document.querySelector('html')
		const iframeHtml = iframeHtmlElement?.outerHTML
		const isIframeEmpty = iframeHtml === '<html><head></head><body></body></html>'

		const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
		const apiKey = input?.value ?? null
		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{(derivedStreamingStage === 'requesting' ||
					derivedStreamingStage === 'streaming' ||
					(derivedStreamingStage === 'uploaded' && iframeRef.current)) && (
					<>
						<form
							ref={formRef}
							target={`output-${shape.id}`}
							action="/api/openai"
							method="post"
							style={{
								display: 'contents',
							}}
							onSubmit={(e) => e.preventDefault()}
						>
							<input type="hidden" name="messages" value={JSON.stringify(shape.props.messages)} />
							<input type="hidden" name="shapeId" value={shape.id} />
							<input type="hidden" name="apiKey" value={apiKey} />
						</form>
						<iframe
							ref={iframeRef}
							width={toDomPrecision(shape.props.w)}
							height={toDomPrecision(shape.props.h)}
							style={{
								backgroundColor: 'var(--color-panel)',
								pointerEvents: isEditing ? 'auto' : 'none',
								boxShadow,
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
							}}
							name={`output-${shape.id}`}
							id={`output-${shape.id}`}
							onLoad={() => {
								const iframeHtmlElement =
									iframeRef.current?.contentWindow?.document.querySelector('html')
								const injectedScreenshotScript = getScriptToInjectForPreview(shape.id)
								const iframeHtml = iframeHtmlElement.outerHTML.replaceAll(
									injectedScreenshotScript,
									''
								)

								this.editor.updateShape<PreviewShape>({
									id: shape.id,
									type: 'preview',
									props: {
										html: iframeHtml,
									},
								})
								console.log('iframe loaded', iframeHtml)
							}}
							//   onLoad={() => {
							//     setLoadingByPromptId({
							//       ...loadingByPromptId,
							//       [id]: "finished",
							//     });
							//   }}
						/>
					</>
				)}
				{derivedStreamingStage === 'uploaded' && !iframeRef.current && (
					<iframe
						id={`iframe-1-${shape.id}`}
						src={`${uploadUrl}?preview=1&v=${linkUploadVersion}`}
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							backgroundColor: 'var(--color-panel)',
							pointerEvents: isEditing ? 'auto' : 'none',
							boxShadow,
							border: '1px solid var(--color-panel-contrast)',
							borderRadius: 'var(--radius-2)',
						}}
					/>
				)}
				{
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
							pointerEvents: derivedStreamingStage === 'uploaded' ? 'all' : 'none',
						}}
					>
						<Dropdown boxShadow={boxShadow} html={shape.props.html} uploadUrl={uploadUrl}>
							<button className="bg-white rounded p-2" style={{ boxShadow }}>
								{derivedStreamingStage !== 'uploaded' ? (
									<DefaultSpinner />
								) : (
									<TldrawUiIcon icon="dots-vertical" />
								)}
							</button>
						</Dropdown>
					</div>
				}
			</HTMLContainer>
		)
	}

	override toSvg(shape: PreviewShape, _ctx: SvgExportContext) {
		// while screenshot is the same as the old one, keep waiting for a new one
		return new Promise<ReactElement>((resolve, reject) => {
			if (window === undefined) {
				reject()
				return
			}

			const windowListener = (event: MessageEvent) => {
				if (event.data.screenshot && event.data?.shapeid === shape.id) {
					// const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
					// image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', event.data.screenshot)
					// image.setAttribute('width', shape.props.w.toString())
					// image.setAttribute('height', shape.props.h.toString())
					// g.appendChild(image)
					window.removeEventListener('message', windowListener)
					clearTimeout(timeOut)

					resolve(<PreviewImage href={event.data.screenshot} shape={shape} />)
				}
			}
			const timeOut = setTimeout(() => {
				reject()
				window.removeEventListener('message', windowListener)
			}, 2000)
			window.addEventListener('message', windowListener)
			//request new screenshot
			const firstLevelIframe = (document.getElementById(`iframe-1-${shape.id}`) ??
				document.getElementById(`output-${shape.id}`)) as HTMLIFrameElement
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

	indicator(shape: PreviewShape) {
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

function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}

function PreviewImage({ shape, href }: { shape: PreviewShape; href: string }) {
	return <image href={href} width={shape.props.w.toString()} height={shape.props.h.toString()} />
}
