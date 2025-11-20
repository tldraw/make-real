import {
	TLUiDialogProps,
	TldrawUiButton,
	TldrawUiButtonLabel,
	TldrawUiDialogBody,
	TldrawUiDialogCloseButton,
	TldrawUiDialogFooter,
	TldrawUiDialogHeader,
	TldrawUiDialogTitle,
	TldrawUiIcon,
	TldrawUiInput,
	useReactor,
	useValue,
} from 'tldraw'
import { PROVIDERS, makeRealSettings } from '../lib/settings'

export function SettingsDialog({ onClose }: TLUiDialogProps) {
	const settings = useValue('settings', () => makeRealSettings.get(), [])

	useReactor(
		'update settings local storage',
		() => {
			localStorage.setItem('makereal_settings_2', JSON.stringify(makeRealSettings.get()))
		},
		[]
	)

	return (
		<>
			<TldrawUiDialogHeader>
				<TldrawUiDialogTitle>Settings</TldrawUiDialogTitle>
				<TldrawUiDialogCloseButton />
			</TldrawUiDialogHeader>
			<TldrawUiDialogBody
				style={{ maxWidth: 350, display: 'flex', flexDirection: 'column', gap: 8 }}
			>
				<p>
					To use Make Real, enter your API key for each model provider that you wish to use. Draw
					some shapes, then select the shapes and click Make Real.{' '}
					<a
						target="_blank"
						href="https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4"
					>
						<u>Read our guide.</u>
					</a>
				</p>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
						<label style={{ flexGrow: 2 }}>Provider</label>
					</div>
					<div className="apikey_select_container">
						<select
							className="apikey_select"
							value={settings.provider}
							onChange={(e) => {
								makeRealSettings.update((s) => ({ ...s, provider: e.target.value as any }))
							}}
						>
							{PROVIDERS.map((provider) => {
								return (
									<option key={provider.id + 'option'} value={provider.id}>
										{provider.name}
									</option>
								)
							})}
							<option value="all">All</option>
						</select>
					</div>
					{settings.provider !== 'all' && (
						<>
							<div style={{ display: 'flex', flexDirection: 'row', gap: 4, paddingTop: 4 }}>
								<label style={{ flexGrow: 2 }}>Model</label>
							</div>
							<div className="apikey_select_container">
								<select
									className="apikey_select"
									value={settings.models[settings.provider]}
									onChange={(e) => {
										makeRealSettings.update((s) => ({
											...s,
											models: { ...s.models, [settings.provider]: e.target.value as any },
										}))
									}}
								>
									{PROVIDERS.find((p) => p.id === settings.provider)!.models.map((model) => {
										return (
											<option key={model + 'option'} value={model}>
												{model}
											</option>
										)
									})}
								</select>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
								<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
									<label style={{ flexGrow: 2 }}>System prompt</label>
									<button
										style={{ all: 'unset', cursor: 'pointer' }}
										onClick={() => {
											const provider = PROVIDERS.find((p) => p.id === settings.provider)!
											makeRealSettings.update((s) => ({
												...s,
												prompts: {
													...s.prompts,
													[settings.provider]: provider.prompt,
												},
											}))
										}}
									>
										Reset
									</button>
								</div>
							</div>
							<TldrawUiInput
								className="apikey_input prompt_input"
								value={settings.prompts[settings.provider].system}
								autoSelect
								onValueChange={(value) => {
									makeRealSettings.update((s) => ({
										...s,
										prompts: {
											...s.prompts,
											[settings.provider]: { ...s.prompts[settings.provider], system: value },
										},
									}))
								}}
							/>
						</>
					)}
				</div>
				<hr style={{ margin: '12px 0px' }} />
				{PROVIDERS.map((provider) => {
					const value = settings.keys[provider.id]
					return (
						<ApiKeyInput
							provider={provider}
							key={provider.name + 'key'}
							value={value}
							warning={
								value === '' && (settings.provider === provider.id || settings.provider === 'all')
							}
						/>
					)
				})}
				{/* <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
						<label style={{ flexGrow: 2 }}>Google</label>
					</div>
					<TldrawUiInput
						className="apikey_input"
						value={settings.keys.google}
						placeholder="risky but cool"
						onValueChange={(value) => {
							const next = { ...settings, keys: { ...settings.keys, google: value } }
							localStorage.setItem('makereal_settings_2', JSON.stringify(next))
							makeRealSettings.set(next)
						}}
					/>
				</div> */}
			</TldrawUiDialogBody>
			<TldrawUiDialogFooter className="tlui-dialog__footer__actions">
				<TldrawUiButton
					type="primary"
					onClick={async () => {
						onClose()
					}}
				>
					<TldrawUiButtonLabel>Save</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDialogFooter>
		</>
	)
}

function ApiKeyInput({
	provider,
	value,
	warning,
}: {
	provider: (typeof PROVIDERS)[number]
	value: string
	warning: boolean
}) {
	const isValid = value.length === 0 || provider.validate(value)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			<div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
				<label style={{ flexGrow: 2, color: warning ? 'red' : 'var(--color-text)' }}>
					{provider.name} API key
				</label>
				<a style={{ cursor: 'pointer', pointerEvents: 'all' }} target="_blank" href={provider.help}>
					<TldrawUiIcon
						label="Help"
						className="apikey_help_icon"
						small
						icon={provider.validate(value) ? 'check' : 'question-mark-circle'}
					/>
				</a>
			</div>
			<TldrawUiInput
				className={`apikey_input ${isValid ? '' : 'apikey_input__invalid'}`}
				value={value}
				placeholder="risky but cool"
				autoSelect
				onValueChange={(value) => {
					makeRealSettings.update((s) => ({ ...s, keys: { ...s.keys, [provider.id]: value } }))
				}}
			/>
		</div>
	)
}
