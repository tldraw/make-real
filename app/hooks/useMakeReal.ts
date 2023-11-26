import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { makeReal } from '../lib/makeReal'
import { track } from '@vercel/analytics/react'

export function useMakeReal() {
	const editor = useEditor()
	const toast = useToasts()

	return useCallback(async () => {
		const input = document.getElementById('openai_key') as HTMLInputElement
		const apiKey = input?.value ?? null

		// 获取 Base URL
		const baseUrlInput = document.getElementById('openai_baseUrl') as HTMLInputElement;
		const baseUrl = baseUrlInput?.value;

		console.log('API Key:', apiKey); // 调试输出 API Key
		console.log('Base URL:', baseUrl); // 调试输出 Base URL

		track('make_real', { timestamp: Date.now() })

		try {
			await makeReal(editor, apiKey, baseUrl)
		} catch (e: any) {
			track('no_luck', { timestamp: Date.now() })

			console.error(e)
			toast.addToast({
				title: 'Something went wrong',
				description: `${e.message.slice(0, 100)}`,
				actions: [
					{
						type: 'primary',
						label: 'Learn more',
						onClick: () => {
							// open a new tab with the url...
							window.open('https://discord.gg/QHqp9f7ejq', '_blank')
						},
					},
				],
			})
		}
	}, [editor, toast])
}
