import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback, useEffect } from 'react'
import { makeReal } from '../lib/makeReal'
import { track } from '@vercel/analytics/react'
import { useOpenRouter } from './useOpenRouter'

export function useMakeReal() {
	const editor = useEditor()
	const toast = useToasts()
	const { apiKey } = useOpenRouter()

	return useCallback(async () => {
		track('make_real', { timestamp: Date.now() })

		try {
			await makeReal(editor, apiKey)
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
	}, [apiKey, editor, toast])
}
