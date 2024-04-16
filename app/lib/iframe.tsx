import {
	BaseBoxShapeTool,
	Geometry2d,
	Rectangle2d,
	ShapeProps,
	ShapeUtil,
	T,
	TLBaseShape,
	TLEmbedShapePermissions,
	TLOnResizeHandler,
	resizeBox,
	toDomPrecision,
	useIsEditing,
	useValue,
} from 'tldraw'
import { getRotatedBoxShadow } from '../PreviewShape/PreviewShape'

export type IframeShape = TLBaseShape<
	'iframe',
	{
		w: number
		h: number
		url: string
	}
>

export const getSandboxPermissions = (permissions: TLEmbedShapePermissions) => {
	return Object.entries(permissions)
		.filter(([_perm, isEnabled]) => isEnabled)
		.map(([perm]) => perm)
		.join(' ')
}

export class IframeShapeUtil extends ShapeUtil<IframeShape> {
	static override type = 'iframe' as const
	static override props: ShapeProps<IframeShape> = {
		w: T.number,
		h: T.number,
		url: T.string,
	}

	getDefaultProps(): IframeShape['props'] {
		return {
			w: 720,
			h: 480,
			url: 'localhost:3000',
		}
	}

	getGeometry(shape: IframeShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}
	override canEdit = () => true

	override onResize: TLOnResizeHandler<any> = (shape, info) => {
		return resizeBox(shape, info)
	}

	component(shape: IframeShape) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const isEditing = useIsEditing(shape.id)
		return (
			<iframe
				src={shape.props.url}
				width={toDomPrecision(shape.props.w)}
				height={toDomPrecision(shape.props.h)}
				draggable={false}
				style={{
					backgroundColor: 'var(--color-panel)',
					pointerEvents: isEditing ? 'auto' : 'none',
					boxShadow,
					border: '1px solid var(--color-panel-contrast)',
					borderRadius: 'var(--radius-2)',
				}}
				referrerPolicy="no-referrer-when-downgrade"
				sandbox={getSandboxPermissions({
					'allow-downloads-without-user-activation': false,
					'allow-downloads': true,
					'allow-modals': true,
					'allow-orientation-lock': false,
					'allow-pointer-lock': true,
					'allow-popups': true,
					'allow-popups-to-escape-sandbox': true,
					'allow-presentation': true,
					'allow-storage-access-by-user-activation': true,
					'allow-top-navigation': true,
					'allow-top-navigation-by-user-activation': true,
					'allow-scripts': true,
					'allow-same-origin': true,
					'allow-forms': true,
				})}
			/>
		)
	}

	indicator(shape: IframeShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

export class IframeTool extends BaseBoxShapeTool {
	static override id = 'iframe'
	static override initial = 'idle'
	override shapeType = 'iframe'
}
