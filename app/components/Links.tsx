import { TldrawUiMenuGroup, TldrawUiMenuItem } from 'tldraw'

declare global {
	interface Window {
		tlanalytics: {
			openPrivacySettings(): void
		}
		TL_GA4_MEASUREMENT_ID: string | undefined
	}
}

export function openUrl(url: string) {
	window.open(url, '_blank')
}

export function Links() {
	return (
		<TldrawUiMenuGroup id="links">
			<TldrawUiMenuItem
				id="github"
				label="help-menu.github"
				readonlyOk
				icon="github"
				onSelect={() => {
					openUrl('https://github.com/tldraw/tldraw')
				}}
			/>
			<TldrawUiMenuItem
				id="twitter"
				label="help-menu.twitter"
				icon="twitter"
				readonlyOk
				onSelect={() => {
					openUrl('https://twitter.com/tldraw')
				}}
			/>
			<TldrawUiMenuItem
				id="discord"
				label="help-menu.discord"
				icon="discord"
				readonlyOk
				onSelect={() => {
					openUrl('https://discord.gg/SBBEVCA4PG')
				}}
			/>
			<TldrawUiMenuItem
				id="privacy-settings"
				label="Privacy settings"
				icon="external-link"
				readonlyOk
				onSelect={() => {
					window.tlanalytics.openPrivacySettings()
				}}
			/>
			<TldrawUiMenuItem
				id="about"
				label="About"
				icon="external-link"
				readonlyOk
				onSelect={() => {
					openUrl(
						'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4'
					)
				}}
			/>
		</TldrawUiMenuGroup>
	)
}
