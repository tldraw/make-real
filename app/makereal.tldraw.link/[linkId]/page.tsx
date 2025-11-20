import { sql } from '@vercel/postgres'
import { notFound } from 'next/navigation'
import { LinkComponent } from '../../components/LinkComponent'

export const dynamic = 'force-dynamic'

export default async function LinkPage({
	params,
	searchParams,
}: {
	params: { linkId: string }
	searchParams: { preview?: string }
}) {
	const { linkId } = params
	const isPreview = !!searchParams.preview

	const result = await sql`SELECT html FROM links WHERE shape_id = ${linkId}`
	if (result.rows.length !== 1) notFound()

	let html: string = result.rows[0].html

	const SCRIPT_TO_INJECT_FOR_PREVIEW = `
  // Wait for fonts to load before handling screenshot requests
  document.fonts.ready.then(function() {
    window.addEventListener('message', async function(event) {
      if (event.data.action === 'take-screenshot' && event.data.shapeid === "shape:${linkId}") {
        // Small delay to ensure everything is fully rendered
        await new Promise(resolve => setTimeout(resolve, 300));

        html2canvas(document.body, {
          useCORS: true,
          foreignObjectRendering: true,
          allowTaint: true
        }).then(function(canvas) {
          const data = canvas.toDataURL('image/png');
          window.parent.parent.postMessage({screenshot: data, shapeid: "shape:${linkId}"}, "*");
        });
      }
    }, false);
  });

  // Prevent pinch-zooming into the iframe
  document.body.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
  }, { passive: false })
`

	if (isPreview) {
		html = html.includes('</body>')
			? html.replace(
					'</body>',
					`<script src="https://unpkg.com/html2canvas"></script><script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script></body>`
				)
			: html + `<script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script>`
	}

	return <LinkComponent linkId={linkId} isPreview={isPreview} html={html} />
}
