/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { Editor, TLEditorComponents, track } from '@tldraw/tldraw'
import { CodeEditor } from '../CodeEditor/CodeEditor'
import { PreviewShape, PreviewShapeUtil, showingEditor } from '../PreviewShape/PreviewShape'
import { APIKeyInput } from '../components/APIKeyInput'
import { ExportButton } from '../components/ExportButton'
import { LockupLink } from '../components/LockupLink'
import { useState } from 'react'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

const components: TLEditorComponents = {
	InFrontOfTheCanvas: CodeEditor,
}

const Home = track(() => {
	const showing = showingEditor.get()
	const [editor, setEditor] = useState<Editor | undefined>(undefined)
	const shape = editor?.getOnlySelectedShape()
	const previewShape = shape?.type === 'preview' ? (shape as PreviewShape) : undefined
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				components={components}
				shapeUtils={shapeUtils}
				shareZone={<ExportButton />}
				hideUi={showing && !!previewShape}
				onMount={setEditor}
			>
				{(!showing || !previewShape) && (
					<>
						<APIKeyInput />
						<LockupLink />
					</>
				)}
			</Tldraw>
		</div>
	)
})

export default Home
