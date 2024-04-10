/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { APIKeyInput } from '../components/APIKeyInput'
import { ExportButton } from '../components/ExportButton'

import { LinkArea } from '../components/LinkArea'
import { SlideList, SlideShapeUtil, SlideTool, slidesOverrides } from '../lib/slides'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={[PreviewShapeUtil, SlideShapeUtil]}
				components={{
					SharePanel: () => <ExportButton />,
					HelperButtons: SlideList,
					// Minimap: null,
				}}
				tools={[SlideTool]}
				overrides={slidesOverrides}
			>
				<APIKeyInput />
				<LinkArea />
			</Tldraw>
		</div>
	)
}
