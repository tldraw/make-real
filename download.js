// DOWNLOAD
const data = editor.store.getSnapshot()
var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
var downloadAnchorNode = document.createElement('a')
downloadAnchorNode.setAttribute('href', dataStr)
downloadAnchorNode.setAttribute('download', 'demo.json')
downloadAnchorNode.click()
downloadAnchorNode.remove()

// UPLOAD
var f = document.createElement('input')
f.style.display = 'none'
f.type = 'file'
f.name = 'file'
// const currentStore = editor.store.getSnapshot()
f.onchange = function (e) {
	var file = e.target.files[0]
	var reader = new FileReader()
	reader.onload = function (e) {
		var contents = e.target.result
		const parsedContents = JSON.parse(contents)
		const filteredShapeRecords = Object.values(parsedContents.store).filter(
			(value) => value.type !== 'iframe' && value.type !== 'slide' && value.typeName === 'shape'
		)

		editor.createShapes(filteredShapeRecords)

		// parsedContents.store = Object.fromEntries(filteredEntries)
		// editor.store.put(parsedContents.store)
		// console.log(parsedContents)
		// editor.store.loadSnapshot({ schema: currentStore.schema, store: parsedContents.store })
		// editor.store.loadSnapshot(parsedContents)
	}
	reader.readAsText(file)
}
f.click()
// editor.updateInstanceState({ isFocused: true })
