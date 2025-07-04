/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

export const maxDuration = 120

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { MakeRealButton } from '../components/MakeRealButton'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'

import Script from 'next/script'
import { useEffect } from 'react'
import { debugEnableLicensing, DefaultMainMenu, DefaultMainMenuContent, useDialogs } from 'tldraw'
import { Links } from '../components/Links'
import { SettingsDialog } from '../components/SettingsDialog'
import {
	applySettingsMigrations,
	makeRealSettings,
	MIGRATION_VERSION,
	PROVIDERS,
} from '../lib/settings'

debugEnableLicensing()

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]
const components = {
	SharePanel: () => <MakeRealButton />,
	MainMenu: () => (
		<DefaultMainMenu>
			<DefaultMainMenuContent />
			<Links />
		</DefaultMainMenu>
	),
}

export default function Home() {
	useEffect(() => {
		window.TL_GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
	}, [])

	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={shapeUtils}
				components={components}
				onMount={(e) => {
					;(window as any).editor = e
				}}
			>
				<InsideTldrawContext />
			</Tldraw>
			<Script
				id="tldraw-analytics"
				type="text/javascript"
				strategy="afterInteractive"
				async
				defer
				src="https://analytics.tldraw.com/tl-analytics.js"
			/>
		</div>
	)
}

function InsideTldrawContext() {
	const { addDialog } = useDialogs()

	useEffect(() => {
		let prevSettings
		const localSettings = localStorage.getItem('makereal_settings_2')
		if (localSettings) {
			try {
				prevSettings = JSON.parse(localSettings)
			} catch (e) {
				console.log(e)
			}
		}
		if (prevSettings) {
			let prevVersion = 0
			const localVersion = localStorage.getItem('makereal_version')
			if (localVersion) {
				try {
					prevVersion = parseInt(localVersion)
				} catch (e) {
					console.log(e)
				}
			}

			const migratedSettings = applySettingsMigrations(prevSettings, prevVersion)
			makeRealSettings.set(migratedSettings)
		}

		const settings = makeRealSettings.get()
		localStorage.setItem('makereal_settings_2', JSON.stringify(settings))
		localStorage.setItem('makereal_version', MIGRATION_VERSION.toString())

		for (const provider of PROVIDERS) {
			const apiKey = settings.keys[provider.id]
			if (apiKey && provider.validate(apiKey)) {
				return
			}
		}

		// no valid key found, show the settings modal
		addDialog({
			id: 'api keys',
			component: SettingsDialog,
		})
	}, [addDialog])

	return null
}
