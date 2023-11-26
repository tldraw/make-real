const systemPrompt = `You are an expert web developer who specializes in tailwind css.
A user will provide you with a low-fidelity wireframe of an application.
You will return a single html file that uses HTML, tailwind css, and JavaScript to create a high fidelity website.
Include any extra CSS and JavaScript in the html file.
If you have any images, load them from Unsplash or use solid colored rectangles.
The user will provide you with notes in blue or red text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.
They may also provide you with the html of a previous design that they want you to iterate from.
Carry out any changes they request from you.
In the wireframe, the previous design's html will appear as a white rectangle.
For your reference, all text from the image will also be provided to you as a list of strings, separated by newlines. Use them as a reference if any text is hard to read.
Use creative license to make the application more fleshed out.
Use JavaScript modules and unpkg to import any necessary dependencies.

Respond ONLY with the contents of the html file.`

const maxHistoryLength = 4

export async function getHtmlFromOpenAI({
	image,
	apiKey,
	text,
	history,
}: {
	image: string
	apiKey: string
	text: string,
	history: ChatCompletionMessage[],
}): Promise<{
	response: ChatCompletionResponse | ChatCompletionErrorResponse,
	history: ChatCompletionMessage[]
}> {

	const previousMessages = history
		.filter((message) => message.role !== 'system')
		.slice(-maxHistoryLength)
	const messages: ChatCompletionMessage[] = [
		{
			role: 'system',
			content: systemPrompt,
		},
		...previousMessages,
		{
			role: 'user',
			content: [
				{
					type: 'image_url',
					image_url: {
						url: image,
						detail: 'high',
					},
				},
				{
					type: 'text',
					text: previousMessages.length === 0 ? 'Turn this into a single html file using tailwind.' : 'Adjust the design using my feedback.',
				},
				{
					type: 'text',
					text: `Notes:\n${text}`,
				},
			],
		},
	]

	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages,
	}


	const newHistory: ChatCompletionMessage[] = [...messages]

	let json = null
	if (!apiKey) {
		throw Error('You need to provide an API key (sorry)')
	}
	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})
		console.log(resp)
		json = await resp.json()

		newHistory.push(json.choices[0].message)
	} catch (e) {
		console.log(e)
	}

	return {
		response: json,
		history: newHistory,
	}
}

type MessageContent =
	| string
	| (
			| string
			| {
					type: 'image_url'
					image_url:
						| string
						| {
								url: string
								detail: 'low' | 'high' | 'auto'
						  }
			  }
			| {
					type: 'text'
					text: string
			  }
	  )[]

export type ChatCompletionMessage = {
	role: 'system' | 'user' | 'assistant' | 'function'
	content: MessageContent
	name?: string | undefined
}

export type GPT4VCompletionRequest = {
	model: 'gpt-4-vision-preview'
	messages: ChatCompletionMessage[]
	functions?: any[] | undefined
	function_call?: any | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}

export type ChatCompletionResponse = {
	id: string
	error: undefined
	object: 'chat.completion'
	created: number
	model: string
	system_fingerprint: string
	choices: {
		index: number
		message: {
			role: "assistant",
			content: string
		},
		finish_reason: 'stop' | 'length' | 'content_filter',
	}[]
}

export type ChatCompletionErrorResponse = {
	error: Error
}