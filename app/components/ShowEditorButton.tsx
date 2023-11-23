'use client'
import { Icon, stopEventPropagation, track, useEditor } from '@tldraw/tldraw'
import { PreviewShape, showingEditor } from '../PreviewShape/PreviewShape'
import { EDITOR_WIDTH } from '../CodeEditor/CodeEditor'

export const ShowEditorButton = track(({ shape }: { shape: PreviewShape }) => {
	const showing = showingEditor.get()
	const editor = useEditor()
	const bounds = editor.getViewportPageBounds()
	return (
		<button
			style={{
				all: 'unset',
				height: 40,
				width: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				pointerEvents: 'all',
			}}
			onClick={() => {
				if (!showing) {
					editor.centerOnPoint(
						{
							x: shape.x + bounds.width / 2 - (EDITOR_WIDTH + 69) / editor.getZoomLevel(),
							y: shape.y + bounds.height / 2 - 64 / editor.getZoomLevel(),
						},
						{ duration: 400 }
					)
				}
				showingEditor.set(!showing)
			}}
			onPointerDown={stopEventPropagation}
			title={showing ? 'Hide editor' : 'Show editor'}
		>
			<Icon icon={showing ? 'following' : 'follow'} />
		</button>
	)
})
