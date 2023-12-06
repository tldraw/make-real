'use server'

export async function createReplitProject(
	html: string
): Promise<{ error: true; url: undefined } | { error: undefined; url: string }> {
	const response = await fetch('https://replit.com/external/v1/claims', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title: 'My Tldraw Repl',
			files: [{ path: 'index.html', content: html }],
			secret: process.env.REPLIT_CLAIMS_KEY,
		}),
	}).then((r) => r.json())

	if (response.success) {
		return { error: undefined, url: response.link }
	}

	return { error: true, url: undefined }
}
