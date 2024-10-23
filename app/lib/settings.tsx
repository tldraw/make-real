import { atom } from 'tldraw'
import { SYSTEM_PROMPT } from '../prompt'

export const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		models: ['gpt-4o-2024-08-06', 'gpt-4o-mini', 'gpt-4-turbo'], //, 'o1-preview', 'o1-mini'],
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#a9b75e58b1824962a1a69a2f29ace9be',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		models: [
			'claude-3-5-sonnet-20241022',
			'claude-3-5-sonnet-20240620',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307',
		],
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#3444b55a2ede405286929956d0be6e77',
		validate: (key: string) => key.startsWith('sk-ant-api'),
	},
	// { id: 'google', name: 'Google', model: 'Gemeni 1.5 Flash', validate: (key: string) => true },
]

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as (typeof PROVIDERS)[number]['id'] | 'all',
	models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
	keys: {
		openai: '',
		anthropic: '',
		google: '',
	},
	prompts: {
		system: SYSTEM_PROMPT,
	},
})

export function applySettingsMigrations(settings) {
	const { keys, prompts, ...rest } = settings

	const settingsWithModelsProperty = {
		provider: 'openai',
		models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
		keys: {
			openai: '',
			anthropic: '',
			google: '',
			...keys,
		},
		prompts: {
			system: SYSTEM_PROMPT,
			...prompts,
		},
		...rest,
	}

	return settingsWithModelsProperty
}
