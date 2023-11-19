const systemPrompt = `You are an expert app developer who specializes in Flutter.
A user will provide you with a low-fidelity wireframe of an application.
You will return a single Dart file to create a high fidelity application.
Include any extra Dart in the Dart file.
If you have any images, load them from Unsplash or use solid colored rectangles.
The user will provide you with notes in blue or red text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.
They may also provide you with the Application of a previous design that they want you to iterate from.
Carry out any changes they request from you.
In the wireframe, the previous design will appear as a white rectangle.
For your reference, all text from the image will also be provided to you as a list of strings, separated by newlines. Use them as a reference if any text is hard to read.
Use creative license to make the application more fleshed out.

Respond ONLY with the contents of the Dart file.Please make sure that the code compiles successfully.`

export async function getDartFromOpenAI({
	image,
	dart,
	apiKey,
	text,
}: {
	image: string
	dart: string
	apiKey: string
	text: string
}) {
	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt,
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
					{
						type: 'text',
						text: 'Turn this into a single dart file.',
					},
					{
						type: 'text',
						text: dart,
					},
					{
						type: 'text',
						text,
					},
				],
			},
		],
	}

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
	} catch (e) {
		console.log(e)
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
	model: 'gpt-4-vision-preview'
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
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
