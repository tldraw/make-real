import { atom } from 'tldraw'
import {
	ANTHROPIC_SYSTEM_PROMPT,
	GOOGLE_SYSTEM_PROMPT,
	LEGACY_SYSTEM_PROMPT,
	OPENAI_SYSTEM_PROMPT,
} from '../prompt'

export const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		models: [
			'gpt-4.1-2025-04-14',
			'gpt-4o',
			'gpt-4o-mini',
			'gpt-4-turbo',
			'o3-pro-2025-06-10',
			'o4-mini-2025-04-16',
		], // 'o1-preview', 'o1-mini'],
		prompt: OPENAI_SYSTEM_PROMPT,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#a9b75e58b1824962a1a69a2f29ace9be',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		models: [
			'claude-sonnet-4-20250514',
			'claude-3-7-sonnet-20250219',
			'claude-3-7-sonnet-20250219 (thinking)',
			'claude-3-5-sonnet-20241022',
			'claude-3-5-sonnet-20240620',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307',
		],
		prompt: ANTHROPIC_SYSTEM_PROMPT,
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#3444b55a2ede405286929956d0be6e77',
		validate: (key: string) => key.startsWith('sk-'),
	},
	{
		id: 'google',
		name: 'Google',
		models: [
			'gemini-2.5-pro-preview-06-05',
			'gemini-2.5-flash-preview-05-20',
			// 'gemini-2.5-pro-preview-03-25',
			'gemini-2.0-flash',
			'gemini-1.5-pro',
		],
		prompt: GOOGLE_SYSTEM_PROMPT,
		help: '',
		validate: (key: string) => key.startsWith('AIza'),
	},
]

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as (typeof PROVIDERS)[number]['id'] | 'all',
	models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
	keys: { openai: '', anthropic: '', google: '' },
	prompts: {
		system: LEGACY_SYSTEM_PROMPT,
		openai: OPENAI_SYSTEM_PROMPT,
		anthropic: ANTHROPIC_SYSTEM_PROMPT,
		google: GOOGLE_SYSTEM_PROMPT,
	},
})

type Settings = ReturnType<typeof makeRealSettings.get>

export const MIGRATION_VERSION = 3

export function applySettingsMigrations(settings: Settings, version: number | undefined) {
	const { keys, ...rest } = settings

	const settingsWithModelsProperty: Settings = {
		provider: 'anthropic',
		models: Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.models[0]])),
		keys: { openai: '', anthropic: '', google: '', ...keys },
		prompts: {
			system: LEGACY_SYSTEM_PROMPT,
			openai: OPENAI_SYSTEM_PROMPT,
			anthropic: ANTHROPIC_SYSTEM_PROMPT,
			google: GOOGLE_SYSTEM_PROMPT,
		},
		...rest,
	}

	if (!version || version < 3) {
		settingsWithModelsProperty.models.google = 'gemini-2.5-pro-preview-06-05'
		settingsWithModelsProperty.models.openai = 'gpt-4.1-2025-04-14'
		settingsWithModelsProperty.models.anthropic = 'claude-sonnet-4-20250514'
	}

	return settingsWithModelsProperty
}
