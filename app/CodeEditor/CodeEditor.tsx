import { OnChange } from '@monaco-editor/react'
import { track, useEditor, useIsDarkMode, stopEventPropagation, debounce } from '@tldraw/tldraw'
import { useState } from 'react'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { updateLink } from '../lib/uploadLink'
import { PreviewShape } from '../PreviewShape/PreviewShape'

export const CodeEditor = track(() => {
	const editor = useEditor()
	const dark = useIsDarkMode()
	const bounds = editor.getViewportPageBounds()
	const shape = editor.getOnlySelectedShape()
	const previewShape = shape?.type === 'preview' ? (shape as PreviewShape) : undefined
	const [value, setValue] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const handleOnChange: OnChange = (value) => {
		setValue(value)
	}

	if (!bounds || !previewShape || previewShape.type !== 'preview') return null

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
					className="z-10 absolute right-[10px] top-[10px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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

				<div style={{ width: 700, height: 700 }}>
					<MonacoEditor
						defaultLanguage="html"
						value={previewShape.props.html}
						onChange={handleOnChange}
						theme={dark ? 'vs-dark' : 'vs-light'}
						options={{
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
