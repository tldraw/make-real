import { useEffect, useState } from 'react'

const LOCAL_STORAGE_KEY = 'make-real:openrouter-api-key'

export function useOpenRouter() {
	const [apiKey, setApiKey] = useState<string>(localStorage.getItem(LOCAL_STORAGE_KEY))

	useEffect(() => {
		if (window.location.search.includes('code=')) {
			const params = new URLSearchParams(window.location.search)
			const code = params.get('code')
			if (code) {
				fetch('https://openrouter.ai/api/v1/auth/keys', {
					method: 'POST',
					body: JSON.stringify({
						code,
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						localStorage.setItem(LOCAL_STORAGE_KEY, res.key)
						setApiKey(res.key)
						window.location.search = ''
					})
			}
		}
	}, [])

	const getCode = () => {
		window.open(`https://openrouter.ai/auth?callback_url=${window.location.href}`, '_self')
	}

	const removeApiKey = () => {
		localStorage.removeItem(LOCAL_STORAGE_KEY)
		setApiKey('')
	}

	return {
		apiKey,
		getCode,
		removeApiKey,
	}
}
