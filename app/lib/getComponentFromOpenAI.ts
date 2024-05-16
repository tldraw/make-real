export async function getComponentFromOpenAI({
	image,
	apiKey,
	components,
	text, // theme = 'light',
} // previousPreviews,
: {
	image: string
	apiKey: string
	text: string
	components: string
	// theme?: string
	// previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	// const messages: GPT4VCompletionRequest['messages'] = [
	// 	{
	// 		role: 'system',
	// 		content: OPEN_AI_SYSTEM_PROMPT,
	// 	},
	// 	{
	// 		role: 'user',
	// 		content: [],
	// 	},
	// ]

	// const userContent = messages[1].content as Exclude<MessageContent, string>

	// // Add the prompt into
	// userContent.push({
	// 	type: 'text',
	// 	text:
	// 		previousPreviews.length > 0 ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT,
	// })

	// // Add the image
	// userContent.push({
	// 	type: 'image_url',
	// 	image_url: {
	// 		url: image,
	// 		detail: 'high',
	// 	},
	// })

	// // Add the strings of text
	// if (text) {
	// 	userContent.push({
	// 		type: 'text',
	// 		text: `Here's a list of all the text that we found in the design. Use it as a reference if anything is hard to read in the screenshot(s):\n${text}`,
	// 	})
	// }

	// Add the previous previews as HTML
	// for (let i = 0; i < previousPreviews.length; i++) {
	// 	const preview = previousPreviews[i]
	// 	userContent.push(
	// 		{
	// 			type: 'text',
	// 			text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
	// 		},
	// 		{
	// 			type: 'image_url',
	// 			image_url: {
	// 				url: preview.props.source,
	// 				detail: 'high',
	// 			},
	// 		},
	// 		{
	// 			type: 'text',
	// 			text: `And here's the HTML you came up with for it: ${preview.props.html}`,
	// 		}
	// 	)
	// }

	// Prompt the theme
	// userContent.push({
	// 	type: 'text',
	// 	text: `Please make your result use the ${theme} theme.`,
	// })

	const messages: GPT4VCompletionRequest['messages'] = [
		{
			role: 'system',
			content: `
				Create the component that the user is describing with their drawing. Use tailwind for any needed styling (use only as necessary).
				
				eg: If they draw a button that says "Click me", then respond with only: \`<button>Click me</button>\`
				eg: If they write "Hello world" in red, then respond with only: \`<div class="text-red-500">Hello world</div>\`
				eg: If they draw a card with a title and a description, then respond with only:
				\`\`\`
				<div class="card">
					<h1>Title</h1>
					<p>Description</p>
				</div>
				\`\`\`
			`,
		},
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
				// {
				// 	type: 'text',
				// 	text: `Here's a list of any text that we found in the design. Use it as a reference if anything is hard to read in the screenshot(s):\n${text}`,
				// },
				{
					type: 'text',
					text: `Here's all the code for any components that were found in the design:\n${components}`,
				},
			],
		},
	]

	const body: GPT4VCompletionRequest = {
		model: 'gpt-4o',
		max_tokens: 1024,
		temperature: 0,
		messages,
		seed: 42,
		n: 1,
	}

	let json = null

	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})
		json = await resp.json()
	} catch (e) {
		throw Error(`Could not contact OpenAI: ${e.message}`)
	}

	return json
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

export type GPT4VCompletionRequest = {
	model: string
	messages: {
		role: 'system' | 'user' | 'assistant' | 'function'
		content: MessageContent
		name?: string | undefined
	}[]
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
	seed?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
