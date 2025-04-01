import { track } from '@vercel/analytics/react'
import { parseDataStreamPart } from 'ai'
import { useCallback } from 'react'
import { createShapeId, sortByIndex, useDialogs, useEditor, useToasts } from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { SettingsDialog } from '../components/SettingsDialog'
import { blobToBase64 } from '../lib/blobToBase64'
import { getMessages } from '../lib/getMessages'
import { getTextFromSelectedShapes } from '../lib/getTextFromSelectedShapes'
import { htmlify } from '../lib/htmlify'
import { makeRealSettings, PROVIDERS } from '../lib/settings'
import { uploadLink } from '../lib/uploadLink'

export function useMakeReal() {
	const editor = useEditor()
	const { addToast } = useToasts()
	const { addDialog } = useDialogs()

	return useCallback(async () => {
		track('make_real', { timestamp: Date.now() })

		const settings = makeRealSettings.get()
		let didError = false
		if (settings.provider === 'all') {
			for (const provider of PROVIDERS) {
				const apiKey = settings.keys[provider.id]
				if (apiKey && provider.validate(apiKey)) {
					continue
				}
				didError = true
			}
		} else {
			const provider = PROVIDERS.find((p) => p.id === settings.provider)
			const apiKey = settings.keys[settings.provider]
			if (apiKey && provider.validate(apiKey)) {
				// noop
			} else {
				didError = true
			}
		}

		if (didError) {
			addDialog({
				id: 'api keys',
				component: SettingsDialog,
			})
			return
		}

		// no valid key found, show the settings modal

		try {
			const { keys, provider, prompts } = makeRealSettings.get()

			// Get the selected shapes (we need at least one)
			const selectedShapes = editor.getSelectedShapes()

			if (selectedShapes.length === 0) throw Error('First select something to make real.')

			// Create the preview shape
			const { maxX, midY } = editor.getSelectionPageBounds()

			const providers = provider === 'all' ? ['openai', 'anthropic'] : [provider]

			let previewHeight = (540 * 2) / 3
			let previewWidth = (960 * 2) / 3

			const highestPreview = selectedShapes
				.filter((s) => s.type === 'preview')
				.sort(sortByIndex)
				.reverse()[0] as PreviewShape

			if (highestPreview) {
				previewHeight = highestPreview.props.h
				previewWidth = highestPreview.props.w
			}

			const totalHeight = (previewHeight + 40) * providers.length - 40
			let y = midY - totalHeight / 2

			if (highestPreview && Math.abs(y - highestPreview.y) < totalHeight) {
				y = highestPreview.y
			}

			await Promise.allSettled(
				providers.map(async (provider, i) => {
					const newShapeId = createShapeId()

					const maxSize = 1000
					const bounds = editor.getSelectionPageBounds()
					const scale = Math.min(1, maxSize / bounds.width, maxSize / bounds.height)

					const { blob, width, height } = await editor.toImage(selectedShapes, {
						scale: scale,
						background: true,
						format: 'jpeg',
					})

					const dataUrl = await blobToBase64(blob!)

					editor.createShape<PreviewShape>({
						id: newShapeId,
						type: 'preview',
						x: maxX + 60, // to the right of the selection
						y: y + (previewHeight + 40) * i, // half the height of the preview's initial shape
						props: { html: '', w: previewWidth, h: previewHeight, source: dataUrl },
						meta: {
							provider,
						},
					})

					// downloadDataURLAsFile(dataUrl, 'tldraw.png')

					// Get any previous previews among the selected shapes
					const previousPreviews = selectedShapes.filter((shape) => {
						return shape.type === 'preview'
					}) as PreviewShape[]

					if (previousPreviews.length > 0) {
						track('repeat_make_real', { timestamp: Date.now() })
					}

					// Send everything to OpenAI and get some HTML back
					try {
						let result: { text: string; finishReason: string }

						const messages = getMessages({
							image: dataUrl,
							text: getTextFromSelectedShapes(editor),
							previousPreviews,
							theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
						})

						const parts: string[] = []

						switch (provider) {
							case 'openai': {
								const text = await new Promise<string>(async (r) => {
									let text = ''
									let didStart = false
									let didEnd = false
									try {
										const apiKey = keys[provider]

										const abortController = new AbortController()

										const res = await fetch('/api/openai', {
											method: 'POST',
											body: JSON.stringify({
												apiKey,
												messages,
												systemPrompt: prompts.system,
												model: settings.models['openai'],
											}),
											headers: {
												'Content-Type': 'application/json',
											},
											signal: abortController.signal,
										}).catch((err) => {
											throw err
										})

										if (!res.ok) {
											throw new Error((await res.text()) || 'Failed to fetch the chat response.')
										}

										if (!res.body) {
											throw new Error('The response body is empty.')
										}

										const reader = res.body.getReader()
										const decoder = createChunkDecoder()

										while (true) {
											const { done, value } = await reader.read()
											if (done) {
												break
											}

											// Update the completion state with the new message tokens.
											const delta = decoder(value) as string
											text += delta
											if (didEnd) {
												continue
											} else if (!didStart && text.includes('<!DOCTYPE html>')) {
												const startIndex = text.indexOf('<!DOCTYPE html>')
												parts.push(text.slice(startIndex))
												didStart = true
											} else if (didStart && text.includes('</html>')) {
												const endIndex = text.indexOf('</html>')
												parts.push(text.slice(endIndex, endIndex + 7))
												didEnd = true
											} else if (didStart) {
												parts.push(delta)
												editor.updateShape<PreviewShape>({
													id: newShapeId,
													type: 'preview',
													props: {
														parts: [...parts],
													},
												})
											}

											// The request has been aborted, stop reading the stream.
											if (abortController === null) {
												reader.cancel()
												break
											}
										}
									} catch (err) {
										// Ignore abort errors as they are expected.
										if ((err as any).name === 'AbortError') {
											return null
										}

										if (err instanceof Error) {
											// handle error
										}
									}
									r(text)
								})

								result = { text, finishReason: 'complete' }
								break
							}
							case 'anthropic': {
								const text = await new Promise<string>(async (r) => {
									let text = ''
									let didStart = false
									let didEnd = false
									try {
										const apiKey = keys[provider]

										const abortController = new AbortController()

										const res = await fetch('/api/anthropic', {
											method: 'POST',
											body: JSON.stringify({
												apiKey,
												messages,
												systemPrompt: prompts.system,
												model: settings.models['anthropic'],
											}),
											headers: {
												'Content-Type': 'application/json',
											},
											signal: abortController.signal,
										}).catch((err) => {
											throw err
										})

										if (!res.ok) {
											throw new Error((await res.text()) || 'Failed to fetch the chat response.')
										}

										if (!res.body) {
											throw new Error('The response body is empty.')
										}
										const reader = res.body.getReader()
										const decoder = createChunkDecoder()

										while (true) {
											const { done, value } = await reader.read()
											if (done) {
												break
											}

											// Update the completion state with the new message tokens.
											const delta = decoder(value) as string
											text += delta

											// console.log(text)
											if (didEnd) {
												continue
											} else if (!didStart && text.includes('<!DOCTYPE html>')) {
												const startIndex = text.indexOf('<!DOCTYPE html>')
												parts.push(text.slice(startIndex))
												didStart = true
											} else if (didStart && text.includes('</html>')) {
												const endIndex = text.indexOf('</html>')
												parts.push(text.slice(endIndex, endIndex + 7))
												didEnd = true
											} else if (didStart) {
												parts.push(delta)
												editor.updateShape<PreviewShape>({
													id: newShapeId,
													type: 'preview',
													props: {
														parts: [...parts],
													},
												})
											}

											// The request has been aborted, stop reading the stream.
											if (abortController === null) {
												reader.cancel()
												break
											}
										}
									} catch (err) {
										// Ignore abort errors as they are expected.
										if ((err as any).name === 'AbortError') {
											return null
										}

										if (err instanceof Error) {
											// handle error
										}
									}

									console.log(text)
									r(text)
								})

								result = { text, finishReason: 'complete' }
								break
							}
							case 'google': {
								throw Error('not implemented')
							}
						}

						if (!result) {
							throw Error('Could not contact provider.')
						}

						if (result?.finishReason === 'error') {
							console.error(result.finishReason)
							throw Error(`${result.finishReason?.slice(0, 128)}...`)
						}

						// Extract the HTML from the response
						const html = htmlify(result.text)

						// No HTML? Something went wrong
						if (html.length < 100) {
							console.warn(result.text)
							throw Error('Could not generate a design from those wireframes.')
						}

						// Upload the HTML / link for the shape
						await uploadLink(newShapeId, html)

						editor.updateShape<PreviewShape>({
							id: newShapeId,
							type: 'preview',
							props: {
								parts: [],
								html: htmlify(result.text),
								linkUploadVersion: 1,
								uploadedShapeId: newShapeId,
							},
						})

						console.log(`Response: ${result.text}`)
					} catch (e) {
						addToast({
							icon: 'info-circle',
							title: 'Something went wrong',
							description: (e as Error).message.slice(0, 100),
						})
						console.error(e.message)
						// If anything went wrong, delete the shape.
						editor.deleteShape(newShapeId)
						throw e
					}
				})
			)
		} catch (e: any) {
			track('no_luck', { timestamp: Date.now() })

			console.error(e)

			if (e.message.includes('you do not have access to it')) {
				addToast({
					title: 'OpenAI says no access',
					description: `Sorry, you don't have access to this model on OpenAI.`,
					actions: [
						{
							type: 'primary',
							label: 'OpenAI docs',
							onClick: () => {
								// open a new tab with the url...
								window.open(
									'https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4-gpt-4-turbo-gpt-4o-and-gpt-4o-mini',
									'_blank'
								)
							},
						},
						{
							type: 'primary',
							label: 'Learn more',
							onClick: () => {
								// open a new tab with the url...
								window.open(
									'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e',
									'_blank'
								)
							},
						},
					],
				})
			}

			addToast({
				title: 'Something went wrong',
				description: `${e.message.slice(0, 200)}`,
				actions: [
					{
						type: 'primary',
						label: 'Read the guide',
						onClick: () => {
							// open a new tab with the url...
							window.open(
								'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e',
								'_blank'
							)
						},
					},
				],
			})
		}
	}, [editor, addDialog, addToast])
}

function createChunkDecoder(complex?: boolean) {
	const decoder = new TextDecoder()

	if (!complex) {
		return function (chunk: Uint8Array | undefined): string {
			if (!chunk) return ''
			return decoder.decode(chunk, { stream: true })
		}
	}

	return function (chunk: Uint8Array | undefined) {
		const decoded = decoder
			.decode(chunk, { stream: true })
			.split('\n')
			.filter((line) => line !== '') // splitting leaves an empty string at the end

		return decoded.map(parseDataStreamPart).filter(Boolean)
	}
}
