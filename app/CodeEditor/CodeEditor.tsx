import { Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import { stopEventPropagation, track, useEditor, useIsDarkMode } from '@tldraw/tldraw'
import { useState } from 'react'
import { PreviewShape, showingEditor } from '../PreviewShape/PreviewShape'
import { updateLink } from '../lib/uploadLink'

export const EDITOR_WIDTH = 700

export const CodeEditor = track(() => {
	const editor = useEditor()
	const dark = useIsDarkMode()
	const bounds = editor.getViewportPageBounds()
	const shape = editor.getOnlySelectedShape()
	const previewShape = shape?.type === 'preview' ? (shape as PreviewShape) : undefined
	const [value, setValue] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const showEditor = showingEditor.get()
	const handleOnChange: OnChange = (value) => {
		setValue(value)
	}

	if (!bounds || !previewShape || !showEditor) return null

	const pageCoordinates = editor.pageToScreen(bounds.point)

	return (
		<div
			style={{
				position: 'absolute',
				top: Math.max(64, pageCoordinates.y - 64),
				left: 20,
				border: '1px solid #eee',
				pointerEvents: 'all',
			}}
			onPointerDown={(e) => stopEventPropagation(e)}
			onKeyUp={async (e) => {
				if (e.key === 's' && e.ctrlKey) {
					setIsSaving(true)
					if (!value && value === '') return
					await updateLink(shape.id, value)
					editor.updateShape<PreviewShape>({
						id: previewShape.id,
						type: 'preview',
						props: {
							html: value,
							linkUploadVersion: previewShape.props.linkUploadVersion + 1,
						},
					})
					setIsSaving(false)
				}
			}}
		>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<button
					className="z-10 absolute right-[10px] bottom-[10px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={async () => {
						if (!value && value === '') return
						await updateLink(shape.id, value)
						editor.updateShape<PreviewShape>({
							id: previewShape.id,
							type: 'preview',
							props: {
								html: value,
								linkUploadVersion: previewShape.props.linkUploadVersion + 1,
							},
						})
					}}
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>

				<div style={{ width: EDITOR_WIDTH, height: 700 }}>
					<MonacoEditor
						defaultLanguage="html"
						value={previewShape.props.html}
						onChange={handleOnChange}
						theme={dark ? 'vs-dark' : 'vs-light'}
						options={{
							renderLineHighlight: 'none',
							overviewRulerBorder: false,
							overviewRulerLanes: 0,
							padding: {
								top: 16,
							},
							minimap: {
								enabled: false,
							},
							lineNumbers: 'off',
							scrollbar: {
								vertical: 'hidden',
							},
							wordWrap: 'wordWrapColumn',
							wordWrapColumn: 80,
							fontSize: 13,
						}}
					/>
				</div>
			</div>
		</div>
	)
})
