import { useMakeHappen } from '../hooks/useMakeHappen'
import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()
	const makeHappen = useMakeHappen()

	return (
		<div
			style={{
				display: 'flex',
				gap: '0px',
			}}
		>
			<button
				onClick={makeHappen}
				// className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
					Make Happen
				</div>
			</button>
			<button
				onClick={makeReal}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button>
		</div>
	)
}
