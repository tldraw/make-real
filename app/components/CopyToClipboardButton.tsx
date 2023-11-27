import { Icon, stopEventPropagation, useToasts } from '@tldraw/tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'

export function CopyToClipboardButton({ shape }: { shape: PreviewShape }) {
	const toast = useToasts()
	return (
		<button
			style={{
				all: 'unset',
				height: 40,
				width: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				pointerEvents: 'all',
			}}
			onClick={() => {
				if (navigator && navigator.clipboard) {
					navigator.clipboard.writeText(shape.props.html)
					toast.addToast({
						icon: 'code',
						title: 'Copied html to clipboard',
					})
				}
			}}
			onPointerDown={stopEventPropagation}
			title="Copy code to clipboard"
		>
			<Icon icon="code" />
		</button>
	)
}
