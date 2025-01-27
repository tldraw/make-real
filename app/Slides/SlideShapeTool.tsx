import { BaseBoxShapeTool, TLShape } from 'tldraw'

export class SlideShapeTool extends BaseBoxShapeTool {
	static override id = 'slide'
	static override initial = 'idle'
	override shapeType = 'slide'

	override onCreate = (shape: TLShape | null) => {
		if (!shape) return

		if (this.editor.getInstanceState().isToolLocked) {
			this.editor.setCurrentTool('prompt')
		} else {
			this.editor.setCurrentTool('select.idle')
		}
	}
}
