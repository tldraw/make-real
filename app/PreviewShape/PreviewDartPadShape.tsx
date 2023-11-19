/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	Icon,
	useToasts,
	stopEventPropagation,
	DefaultSpinner,
} from '@tldraw/tldraw'

export type PreviewDartPadShape = TLBaseShape<
	'preview',
	{
		dart: string
		source: string
		w: number
		h: number
	}
>
export class PreviewDartPadShapeUtil extends BaseBoxShapeUtil<PreviewDartPadShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewDartPadShape['props'] {
		return {
			dart: '',
			source: '',
			w: 960,
			h: 540,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewDartPadShape) => false
	override canResize = (_shape: PreviewDartPadShape) => true
	override canBind = (_shape: PreviewDartPadShape) => false
	override canUnmount = () => false

	override component(shape: PreviewDartPadShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		const ifrmId = shape.id + '-ifrm'
		const loaded = () => {
			const ifrm = document.getElementById(ifrmId) as HTMLIFrameElement
			console.log(ifrm)
			ifrm.contentWindow.postMessage(
				{
					sourceCode: { 'main.dart': shape.props.dart },
					type: 'sourceCode',
				},
				'*'
			)
		}
		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{shape.props.dart ? (
					<iframe
						id={ifrmId}
						className="tl-embed"
						src="https://dartpad.dev/embed-flutter_showcase.html?run=true&null_safety=true"
						width={toDomPrecision(shape.props.w)}
						height={toDomPrecision(shape.props.h)}
						draggable={false}
						style={{
							border: 0,
							pointerEvents: isEditing ? 'auto' : 'none',
						}}
						onLoad={loaded}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: -40,
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
					}}
					onClick={() => {
						if (navigator && navigator.clipboard) {
							navigator.clipboard.writeText(shape.props.dart)
							toast.addToast({
								icon: 'code',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
					title="Copy code to clipboard"
				>
					<Icon icon="code" />
				</div>
				<div
					style={{
						textAlign: 'center',
						position: 'absolute',
						bottom: 0,
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
					{isEditing ? null : (
						<span
							style={{
								background: 'var(--color-background)',
								padding: '4px 12px',
								borderRadius: 99,
							}}
						>
							Double click to interact
						</span>
					)}
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: PreviewDartPadShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
