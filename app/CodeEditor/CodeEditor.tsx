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

	return (
		<>
			<div
				style={{
					position: 'absolute',
					top: 20,
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
					<div className="absolute bottom-2.5 right-2.5 flex gap-2.5">
						<button
							onPointerDown={stopEventPropagation}
							onClick={(e) => {
								stopEventPropagation(e)
								showingEditor.set(false)
							}}
							className="bg-white hover:bg-gray-100 text-black border w-[80px] py-2 px-4 rounded box-border z-10 h-9"
							style={{
								pointerEvents: 'all',
							}}
						>
							Dismiss
						</button>
						<button
							className="z-10 bg-blue-500 hover:bg-blue-700 w-[80px] h-9 box-border text-white py-2 px-4 rounded"
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
					</div>
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
		</>
	)
})
