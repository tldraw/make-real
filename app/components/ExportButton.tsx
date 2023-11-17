import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton({
															 mode,
														 }: {
	mode: 'tailwind' | 'threejs',
}) {
	const makeReal = useMakeReal(mode)

	// A tailwind styled button that is pinned to the bottom right of the screen
	return (
		<button
			onClick={makeReal}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			{`Make Real${mode === 'threejs' ? ' (3D!)' : ''}`}
		</button>
	)
}
