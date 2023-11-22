/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { ExportButton } from './components/ExportButton'
import { APIKeyInput } from './components/APIKeyInput'
import { LockupLink } from './components/LockupLink'
import { TLEditorComponents } from '@tldraw/tldraw'
import { CodeEditor } from './CodeEditor/CodeEditor'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { ExportButton } from '../components/ExportButton'
import { useBreakpoint } from '@tldraw/tldraw'
import { APIKeyInput } from '../components/APIKeyInput'
import { track } from '@vercel/analytics/react'
import { LockupLink } from '../components/LockupLink'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

const components: TLEditorComponents = {
	InFrontOfTheCanvas: CodeEditor,
}

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				components={components}
				shapeUtils={shapeUtils}
				shareZone={<ExportButton />}
			>
				<APIKeyInput />
				<LockupLink />
			</Tldraw>
		</div>
	)
}