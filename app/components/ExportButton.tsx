import { useMakeAppear } from '../hooks/useMakeAppear'
import { useMakeHappen } from '../hooks/useMakeHappen'
import { useMakeReal } from '../hooks/useMakeReal'
import { useMakeRealAnthropic } from '../hooks/useMakeRealAnthropic'

export function ExportButton() {
	const makeReal = useMakeReal()
	const makeRealAnthropicHaiku = useMakeRealAnthropic('claude-3-haiku-20240307')
	const makeRealAntrhopicSonnet = useMakeRealAnthropic('claude-3-sonnet-20240229')
	const makeRealAnthropicOpus = useMakeRealAnthropic('claude-3-opus-20240229')
	const makeHappen = useMakeHappen()
	const makeAppear = useMakeAppear()

	return (
		<div
			style={{
				display: 'flex',
				gap: '0px',
			}}
		>
			<button
				onClick={makeReal}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				{/* purple animated gradient */}
				<div className="make-appear-button">Make Real</div>
			</button>
			{/* <button
				onClick={makeHappen}
				// className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
					Make Happen
				</div>
			</button> */}
			{/* <button
				onClick={makeRealAnthropicHaiku}
				className="pl-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button>
			<button
				onClick={makeRealAntrhopicSonnet}
				className="pl-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button>
			<button
				onClick={makeRealAnthropicOpus}
				className="pl-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button> */}
			{/* <button
				onClick={makeReal}
				className="p-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button> */}
		</div>
	)
}
