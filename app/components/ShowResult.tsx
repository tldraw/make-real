import { toDomPrecision } from '@tldraw/tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'

export function ShowResult({
	boxShadow,
	isEditing,
	html,
	shape,
}: {
	boxShadow: string
	isEditing: boolean
	html: string
	shape: PreviewShape
}) {
	return (
		<iframe
			srcDoc={html}
			width={toDomPrecision(shape.props.w)}
			height={toDomPrecision(shape.props.h)}
			draggable={false}
			style={{
				flexShrink: 1,
				pointerEvents: isEditing ? 'auto' : 'none',
				boxShadow,
				border: '1px solid var(--color-panel-contrast)',
				borderRadius: 'var(--radius-2)',
			}}
		/>
	)
}
