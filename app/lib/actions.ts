'use server'

import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { SYSTEM_PROMPT } from '../prompt'

export async function getContentFromAnthropic(messages: any) {
	const { text, finishReason, usage } = await generateText({
		model: anthropic('claude-3-5-sonnet-20240620'),
		system: SYSTEM_PROMPT,
		messages,
	})

	return { text, finishReason, usage }
}
