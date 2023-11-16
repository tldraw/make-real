const tailwindSystemPrompt = `You are an expert web developer who specializes in tailwind css.
A user will provide you with a low-fidelity wireframe of an application. 
You will return a single html file that uses HTML, tailwind css, and JavaScript to create a high fidelity website.
Include any extra CSS and JavaScript in the html file.
If you have any images, load them from Unsplash or use solid colored rectangles.
The user will provide you with notes in blue or red text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.
They may also provide you with the html of a previous design that they want you to iterate from.
Carry out any changes they request from you.
In the wireframe, the previous design's html will appear as a white rectangle.
Use creative license to make the application more fleshed out.
Use JavaScript modules and unpkg to import any necessary dependencies.

Respond ONLY with the contents of the html file.`

const threeJsSystemPrompt = `You are an expert web developer who specializes in three.js.
A user will provide you with a low-fidelity wireframe of an application.
You will return a single html file that uses HTML, three.js, and JavaScript to create a high fidelity website.
Add a hidden div into the start of the body that includes the detailed instructions from the user, the contents adjusted to take the requested changes into account. If for example the user requests a change to the color of a button, change the color of the button in the instructions also, instead of saying "change button color".
Include any extra CSS and JavaScript in the html file.
The user will provide you with notes in text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching colors.
Prefer to use standard materials instead of basic and avoid custom shaders.
Unless otherwise specified, set up orbit controls and a directional light attached to the camera.
Use an import map e.g. <script type="importmap">{"imports": {"three": "https://unpkg.com/three@0.138.0/build/three.module.js","OrbitControls": "https://unpkg.com/three@0.138.0/examples/jsm/controls/OrbitControls.js"}}</script>
They may also provide you with the html of a previous design that they want you to iterate from.
Carry out any changes they request from you, keep everything the same except for the requested changes.
In the wireframe, the previous design's html will appear as a white rectangle.
Use creative license to make the application more fleshed out.
Use JavaScript modules and unpkg to import any necessary dependencies.
Respond ONLY with the contents of the html file.`

const threeJsText = 'Turn this into a single html file using three.js.'
const tailwindText = 'Turn this into a single html file using tailwind.'
const changesText = 'Please make the changes as specified in the image.'

export async function getHtmlFromOpenAI({
																					image,
																					apiKey,
																					mode,
																					history,
																				}: {
	image: string;
	apiKey: string;
	mode: 'tailwind' | 'threejs',
	history: CompletionMessageItem[],
}) {
	const userMessage: CompletionMessageItem = {
		role: 'user',
		content: [
			{
				type: 'image_url',
				image_url: {
					url: image,
					detail: 'high',
				},
			},
		],
	}

	if (history.length === 0) {
		(userMessage.content as any[]).push({
			type: 'text',
			text: mode === 'tailwind' ? tailwindText : threeJsText,
		})
	} else {
		(userMessage.content as any[]).push({
			type: 'text',
			text: changesText,
		})
	}

	const systemMessage: CompletionMessageItem = {
		role: 'system',
		content: mode === 'tailwind' ? tailwindSystemPrompt : threeJsSystemPrompt,
	}

	const last4NonSystemMessages = history
		.filter((item) => item.role !== 'system')
		.slice(-4)

	const messages: CompletionMessageItem[] = [
		systemMessage,
		...last4NonSystemMessages,
		userMessage,
	]

	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages,
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
		json = await resp.json()
	} catch (e) {
		console.error(e)
	}

	const newHistory = [...messages]

	if (json) {
		newHistory.push(json.choices[0].message)
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

export type CompletionMessageItem = {
	role: 'system' | 'user' | 'assistant' | 'function'
	content: MessageContent
	name?: string | undefined
};

export type GPT4VCompletionRequest = {
	model: 'gpt-4-vision-preview'
	messages: CompletionMessageItem[]
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
