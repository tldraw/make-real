import {
	useEditor,
	getSvgAsImage,
	useToasts,
	createShapeId,
} from '@tldraw/tldraw'
import { useEffect, useState } from 'react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { PreviewModal } from './PreviewModal';
  
export function MakeRealButton() {
	const editor = useEditor()
	const [loading, setLoading] = useState(false)
	const toast = useToasts()

	// A tailwind styled button that is pinned to the bottom right of the screen
	return (
		<button
			onClick={async (e) => {
				setLoading(true)
				try {
					e.preventDefault()

					const selectedShapes = editor.getSelectedShapes()
					const previewPosition = selectedShapes.reduce(
						(acc, shape) => {
							const bounds = editor.getShapePageBounds(shape)
							const right = bounds?.maxX ?? 0
							const top = bounds?.minY ?? 0
							return {
								x: Math.max(acc.x, right),
								y: Math.min(acc.y, top),
							}
						},
						{ x: 0, y: Infinity }
					)

					const previousPreviews = selectedShapes.filter((shape) => {
						return shape.type === 'preview'
					}) as PreviewShape[]

					if (previousPreviews.length > 1) {
						throw new Error(
							'You can only give the developer one previous design to work with.'
						)
					}

					const previousHtml =
						previousPreviews.length === 1
							? previousPreviews[0].props.html
							: 'No previous design has been provided this time.'

					const svg = await editor.getSvg(selectedShapes)
					if (!svg) {
						return
					}

					const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(
						navigator.userAgent
					)

					const blob = await getSvgAsImage(svg, IS_SAFARI, {
						type: 'png',
						quality: 1,
						scale: 1,
					})

					const dataUrl = await blobToBase64(blob!)

					const id = createShapeId()
					editor.createShape<PreviewShape>({
						id,
						type: 'preview',
						x: previewPosition.x,
						y: previewPosition.y,
						props: { html: '', source: dataUrl as string },
					})

					const resp = await fetch('/api/toHtml', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							image: dataUrl,
							html: previousHtml,
							apiKey:
								(
									document.getElementById(
										'openai_key_risky_but_cool'
									) as HTMLInputElement
								)?.value ?? null,
						}),
					})

					const json = await resp.json()

					if (json.error) {
						console.error(json)
						toast.addToast({
							icon: 'cross-2',
							title: 'OpenAI API Error',
							description: `${json.error.message?.slice(0, 100)}...`,
						})
						editor.deleteShape(id)
						return
					}

					const message = json.choices[0].message.content
					const start = message.indexOf('<!DOCTYPE html>')
					const end = message.indexOf('</html>')
					const html = message.slice(start, end + '</html>'.length)

					editor.updateShape<PreviewShape>({
						id,
						type: 'preview',
						props: { html, source: dataUrl as string },
					})
				} catch (e: any) {
					console.error(e)
					toast.addToast({
						icon: 'cross-2',
						title: 'Error',
						description: `Something went wrong: ${e.message.slice(0, 100)}`,
					})
				} finally {
					setLoading(false)
				}
			}}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			{loading ? (
				<div className="flex justify-center items-center ">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
				</div>
			) : (
				'Make Real'
			)}
		</button>
	)
}

export function blobToBase64(blob: Blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.readAsDataURL(blob)
	})
}

export function ExportButton({ onToggle }: { onToggle: (showingModal: boolean) => void}) {
	const editor = useEditor();
  
	const [shownHTML, setShownHTML] = useState<string | null>(null);
	const [disabled, setDisabled] = useState(true);

	useEffect(() => {
		onToggle(shownHTML !== null);
	}, [shownHTML]);
  
	useEffect(() => {	
	  if(!editor) return;
  
	  const onChange = () => {
		setDisabled(editor.getSelectedShapes().filter((shape) => {
			return shape.type === "preview";
		  }).length !== 1);
	  };
  
	  editor.on('change', onChange);
  
	  setDisabled(editor.getSelectedShapes().filter((shape) => {
		return shape.type === "preview";
	  }).length !== 1);
  
	  return () => {
		editor.off('change', onChange);
	  };
	}, [editor]);
	
	return (
	  <>
		{shownHTML && (
		  <div
			className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
			style={{ zIndex: 2000, backgroundColor: "rgba(0,0,0,0.5)", pointerEvents: 'auto' }}
			onClick={() => setShownHTML(null)}
		  >
			<PreviewModal html={shownHTML} setHtml={setShownHTML} />
		  </div>
		)}
		{!shownHTML && <button
		  onClick={async (e) => {
			e.preventDefault();

			const selectedShapes = editor.getSelectedShapes();
  
			const previousPreviews = selectedShapes.filter((shape) => {
			  return shape.type === "preview";
			}) as PreviewShape[];
  
			if (previousPreviews.length > 1) {
			  window.alert(
				"No design has been selected. Please select a design to export."
			  );
			}
  
			const previousHtml =
			  previousPreviews.length === 1
				? previousPreviews[0].props.html
				: "No previous design has been provided this time.";
  
			setShownHTML(previousHtml);
		  }}
		  className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2" 
		  	+ (disabled ? ' opacity-50 cursor-not-allowed' : '')}
		  style={{ zIndex: 100000, pointerEvents: 'all' }}
		  disabled={disabled}
		>
		  Show HTML
		</button>}
	  </>
	);
  
  }