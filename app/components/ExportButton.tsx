import { useMakeReal } from '../hooks/useMakeReal'
import { useMakeRealAnthropic } from '../hooks/useMakeRealAnthropic'
import { useMakeRealGoogle } from '../hooks/useMakeRealGoogle'

export function ExportButton() {
	const makeReal = useMakeReal()
	const makeRealAnthropic = useMakeRealAnthropic()
	const makeRealGoogle = useMakeRealGoogle()

	return (
		<div
			style={{
				display: 'flex',
			}}
		>
			<button
				onClick={makeRealGoogle}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Make Real Gemini
				</div>
			</button>
			<button
				onClick={makeRealAnthropic}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-[rgb(190,90,62)] hover:bg-[rgb(170,70,42)] text-white font-bold py-2 px-4 rounded">
					Make Real Claude
				</div>
			</button>
			<button
				onClick={makeReal}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-[rgb(34,184,109)] hover:bg-[rgb(15,165,90)] text-white font-bold py-2 px-4 rounded">
					Make Real GPT
				</div>
			</button>
		</div>
	)
}
