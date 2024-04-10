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
f.onchange = function (e) {
	var file = e.target.files[0]
	var reader = new FileReader()
	reader.onload = function (e) {
		var contents = e.target.result
		editor.store.loadSnapshot(JSON.parse(contents))
	}
	reader.readAsText(file)
}
f.click()
editor.updateInstanceState({ isFocused: true })
