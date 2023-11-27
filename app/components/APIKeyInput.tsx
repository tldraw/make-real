import { Icon, useBreakpoint, useEditor, useValue } from '@tldraw/tldraw'
import { ChangeEvent, useCallback, useState } from 'react'

export function APIKeyInput() {
	const breakpoint = useBreakpoint()
	const [cool, setCool] = useState(false)
	const [baseUrl, setBaseUrl] = useState(localStorage.getItem('makeitreal_baseUrl') ?? '') // 新增状态

	//BaseURL
	const handleBaseUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => { // 新增处理函数
		if (process.env.NODE_ENV === 'development') {
		  localStorage.setItem('makeitreal_baseUrl', e.target.value)
		  setBaseUrl(e.target.value) // 更新状态
		}
	  }, [])

	
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
		const message = `Sorry, this is weird. The OpenAI APIs that we use are very new. If you have an OpenAI developer key, you can put it in this input and we'll use it. We don't save / store / upload these.\n\nSee https://platform.openai.com/api-keys to get a key.\n\nThis app's source code: https://github.com/tldraw/draw-a-ui`
		window.alert(message)
	}, [])

	if (isFocusMode) return null


	return (
		<div className={`your-own-api-key ${breakpoint < 6 ? 'your-own-api-key__mobile' : ''}`}>
		  <div className="your-own-api-key__inner">
			<div className="input__wrapper">
			  <input
				id="openai_key"
				defaultValue={localStorage.getItem('makeitreal_key') ?? ''}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder="Your OpenAI API Key " // 添加placeholder
				spellCheck={false}
				autoCapitalize="off"
			  />
			</div>
			<div className="input__wrapper"> {/* 新增baseUrl输入字段 */}
			  <input
				id="openai_baseUrl"
				value={baseUrl}
				onChange={handleChange}
				placeholder="Your OpenAI Base URL" // 添加placeholder
				spellCheck={false}
				autoCapitalize="off"
			  />
			</div>
			<button className="question__button" onClick={handleQuestionClick}>
			  <Icon icon={cool ? 'check' : 'question'} />
			</button>
		  </div>
		</div>
	  )
	}
	