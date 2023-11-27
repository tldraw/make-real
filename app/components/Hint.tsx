export function Hint({ isEditing }: { isEditing: boolean }) {
	return (
		<div
			style={{
				textAlign: 'center',
				position: 'absolute',
				bottom: isEditing ? -40 : 0,
				padding: 4,
				fontFamily: 'inherit',
				fontSize: 12,
				left: 0,
				width: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				pointerEvents: 'none',
			}}
		>
			<span
				style={{
					background: 'var(--color-panel)',
					padding: '4px 12px',
					borderRadius: 99,
					border: '1px solid var(--color-muted-1)',
				}}
			>
				{isEditing ? 'Click the canvas to exit' : 'Double click to interact'}
			</span>
		</div>
	)
}
