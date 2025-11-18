import { atom } from 'tldraw'
import { ORIGINAL_SYSTEM_PROMPT } from '../prompt'

export const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		models: [
			'gpt-5',
			'gpt-4.1-2025-04-14',
			'gpt-4o',
			'gpt-4o-mini',
			'gpt-4-turbo',
			'o3-pro-2025-06-10',
			'o4-mini-2025-04-16',
		], // 'o1-preview', 'o1-mini'],
		prompt: ORIGINAL_SYSTEM_PROMPT,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#a9b75e58b1824962a1a69a2f29ace9be',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		models: [
			'claude-sonnet-4-5',
			'claude-sonnet-4-20250514',
			'claude-3-7-sonnet-20250219',
			'claude-3-7-sonnet-20250219 (thinking)',
			'claude-3-5-sonnet-20241022',
			'claude-3-5-sonnet-20240620',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307',
		],
		prompt: ORIGINAL_SYSTEM_PROMPT,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#3444b55a2ede405286929956d0be6e77',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'google',
		name: 'Google',
		models: [
			'gemini-3-pro-preview',
			'gemini-2.5-pro',
			'gemini-2.5-flash',
			'gemini-2.5-flash-lite-preview-06-17',
			'gemini-2.0-flash',
			'gemini-1.5-pro',
		],
		prompt: ORIGINAL_SYSTEM_PROMPT,
		help: '',
		validate: (key: string) => key.startsWith('AIza'),
	},
]

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as (typeof PROVIDERS)[number]['id'] | 'all',
	models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
	keys: { openai: '', anthropic: '', google: '' },
	prompts: {
		system: ORIGINAL_SYSTEM_PROMPT,
		openai: ORIGINAL_SYSTEM_PROMPT,
		anthropic: ORIGINAL_SYSTEM_PROMPT,
		google: ORIGINAL_SYSTEM_PROMPT,
	},
})

type Settings = ReturnType<typeof makeRealSettings.get>

export const MIGRATION_VERSION = 11

export function applySettingsMigrations(settings: Settings, version: number | undefined) {
	const { keys, ...rest } = settings

	const settingsWithModelsProperty: Settings = {
		provider: 'anthropic',
		models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
		keys: { openai: '', anthropic: '', google: '', ...keys },
		...rest,
		prompts: {
			system: ORIGINAL_SYSTEM_PROMPT,
			openai: ORIGINAL_SYSTEM_PROMPT,
			anthropic: ORIGINAL_SYSTEM_PROMPT,
			google: ORIGINAL_SYSTEM_PROMPT,
		},
	}

	if (!version || version < 3) {
		settingsWithModelsProperty.models.google = 'gemini-2.5-pro-preview-06-05'
		settingsWithModelsProperty.models.openai = 'gpt-4.1-2025-04-14'
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-20250514'
	}

	if (version < 4) {
		if (settingsWithModelsProperty.models.google === 'gemini-2.5-pro-preview-06-05') {
			settingsWithModelsProperty.models.google = 'gemini-2.5-pro'
		}

		if (settingsWithModelsProperty.models.openai === 'gemini-2.5-flash-preview-05-20') {
			settingsWithModelsProperty.models.openai = 'gemini-2.5-flash'
		}
	}

	if (version < 6) {
		settingsWithModelsProperty.models.openai = 'gpt-5'
	}

	if (version < 7) {
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-5'
	}

	if (version < 8) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro'
	}

	if (version < 9) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro-preview'
	}

	if (version < 10) {
		settingsWithModelsProperty.models.openai = 'gpt-5-main'
	}

	if (version < 11) {
		settingsWithModelsProperty.models.google = 'gemini-3-pro-preview'
		settingsWithModelsProperty.models.openai = 'gpt-5'
	}

	return settingsWithModelsProperty
}
