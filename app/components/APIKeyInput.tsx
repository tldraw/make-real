import { Icon, useBreakpoint, useEditor, useValue } from '@tldraw/tldraw'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useOpenRouter } from '../hooks/useOpenRouter'

export function APIKeyInput() {
	const breakpoint = useBreakpoint()
	const [cool, setCool] = useState(false)
	const { apiKey, getCode, removeApiKey } = useOpenRouter()

	const editor = useEditor()
	const isFocusMode = useValue('is focus mode', () => editor.getInstanceState().isFocusMode, [
		editor,
	])

	// Store the API key locally, but ONLY in development mode
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (process.env.NODE_ENV === 'development') {
			localStorage.setItem('makeitreal_key', e.target.value)
		}
	}, [])

	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			e.currentTarget.blur()
			setCool(true) // its cool
			setTimeout(() => setCool(false), 1200)
		}
	}, [])

	const handleQuestionClick = useCallback(() => {
		const message = `OpenRouter lets app leverage AI without breaking the developer's bank - users pay for what they use!\n\nThis app's source code: https://github.com/tldraw/draw-a-ui`
		window.alert(message)
	}, [])

	if (isFocusMode) return null

	return (
		<div className={`your-own-api-key ${breakpoint < 6 ? 'your-own-api-key__mobile' : ''}`}>
			<div className="your-own-api-key__inner">
				{!apiKey ? (
					<button
						onClick={getCode}
						className="rounded w-full bg-indigo-500 hover:bg-indigo-600 transition-all text-white"
					>
						Access AI via OpenRouter
					</button>
				) : (
					<div className="rounded w-full flex gap-2 items-center px-2">
						<span className="text-xs">
							OpenRouter <b>Connected</b>
						</span>
						<button
							onClick={removeApiKey}
							className="rounded w-full bg-indigo-500 hover:bg-indigo-600 transition-all text-white h-full"
						>
							Remove AI Access
						</button>
					</div>
				)}

				<button className="question__button" onClick={handleQuestionClick}>
					<Icon icon={cool ? 'check' : 'question'} />
				</button>
			</div>
		</div>
	)
}
