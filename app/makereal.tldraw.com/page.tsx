/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { APIKeyInput } from '../components/APIKeyInput'
import { ExportButton } from '../components/ExportButton'

import { Editor } from 'tldraw'
import { LinkArea } from '../components/LinkArea'
import { IframeShapeUtil, IframeTool } from '../lib/iframe'
import {
	$currentSlide,
	SlideList,
	SlideShapeUtil,
	SlideTool,
	getSlides,
	moveToSlide,
} from '../lib/slides'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const overrides = {
	actions(editor: Editor, actions) {
		return {
			...actions,
			'next-slide': {
				id: 'next-slide',
				label: 'Next slide',
				kbd: 'right',
				onSelect() {
					if (editor.getSelectedShapeIds().length > 0) {
						editor.selectNone()
					}
					const slides = getSlides(editor)
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const nextSlide = slides[index + 1]
					editor.stopCameraAnimation()
					if (nextSlide) {
						moveToSlide(editor, nextSlide)
					} else if (currentSlide) {
						moveToSlide(editor, currentSlide)
					} else if (slides.length > 0) {
						moveToSlide(editor, slides[0])
					}
				},
			},
			'previous-slide': {
				id: 'previous-slide',
				label: 'Previous slide',
				kbd: 'left',
				onSelect() {
					if (editor.getSelectedShapeIds().length > 0) {
						editor.selectNone()
					}
					const slides = getSlides(editor)
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const previousSlide = slides[index - 1]
					editor.stopCameraAnimation()
					if (previousSlide) {
						moveToSlide(editor, previousSlide)
					} else if (currentSlide) {
						moveToSlide(editor, currentSlide)
					} else if (slides.length > 0) {
						moveToSlide(editor, slides[slides.length - 1])
					}
				},
			},
		}
	},
	tools(editor: Editor, tools) {
		tools.slide = {
			id: 'slide',
			icon: 'group',
			label: 'Slide',
			kbd: 's',
			onSelect: () => {
				editor.setCurrentTool('slide')
			},
		}
		tools.iframe = {
			id: 'iframe',
			icon: 'link',
			label: 'iFrame',
			kbd: 'i',
			onSelect: () => {
				editor.setCurrentTool('iframe')
			},
		}
		return tools
	},
}

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={[PreviewShapeUtil, SlideShapeUtil, IframeShapeUtil]}
				components={{
					SharePanel: () => <ExportButton />,
					HelperButtons: SlideList,
				}}
				tools={[SlideTool, IframeTool]}
				overrides={overrides}
				onMount={(editor) => {
					window['editor'] = editor
				}}
			>
				<APIKeyInput />
				<LinkArea />
			</Tldraw>
		</div>
	)
}
