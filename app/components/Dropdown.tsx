import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import sdk from '@stackblitz/sdk'
import { stopEventPropagation, useToasts } from '@tldraw/tldraw'
import { useCallback, useState } from 'react'
import { createReplitProject } from '../lib/uploadToReplit'
import { createStackBlitzProject, getCodeSandboxUrl } from '../lib/uploadToThirdParty'

export function Dropdown({
	boxShadow,
	children,
	html,
	uploadUrl,
}: {
	boxShadow: string
	children: React.ReactNode
	html: string
	uploadUrl: string
}) {
	const [open, setOpen] = useState(false)
	const toast = useToasts()

	const copyLink = useCallback(() => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(uploadUrl)
			toast.addToast({
				icon: 'link',
				title: 'Copied link to clipboard',
			})
		}
	}, [uploadUrl, toast])

	const copyHtml = useCallback(() => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(html)
			toast.addToast({
				icon: 'code',
				title: 'Copied html to clipboard',
			})
		}
	}, [html, toast])

	const openInCodeSandbox = useCallback(() => {
		window.open(getCodeSandboxUrl(html))
	}, [html])

	const openInStackBlitz = useCallback(() => {
		sdk.openProject(createStackBlitzProject(html), { openFile: 'index.html' })
	}, [html])

	const [isLoadingReplit, setLoadingReplit] = useState(false)
	const openInReplit = useCallback(
		async (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
			e.preventDefault()
			if (isLoadingReplit) {
				return
			}

			setLoadingReplit(true)
			const { error, url } = await createReplitProject(html)
			setLoadingReplit(false)
			if (error) {
				toast.addToast({ title: 'There was a problem generating your Repl' })
			} else {
				window.open(url)
			}

			setOpen(false)
		},
		[html, isLoadingReplit, toast]
	)

	// const openInCodePen = useCallback(async () => {
	// 	window.open(getCodePenUrl(html))
	// }, [html])

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content side="right" sideOffset={10} align="start">
					<div
						style={{ boxShadow, pointerEvents: 'all', background: '#fdfdfd' }}
						className="flex items-start flex-col text-xs bg-white rounded-[9px] w-full p-1"
					>
						<Item action={copyLink}>Copy link</Item>
						<Item action={copyHtml}>Copy HTML</Item>
						<div
							style={{
								height: '1px',
								margin: '4px -4px',
								width: 'calc(100% + 8px)',
								background: '#e8e8e8',
							}}
						></div>
						<Item action={() => window.open(uploadUrl)}>Open in new tab</Item>
						<Item action={openInCodeSandbox}>Open in CodeSandbox</Item>
						<Item action={openInStackBlitz}>Open in StackBlitz</Item>
						<Item action={openInReplit} rightContent={isLoadingReplit ? <Spinner /> : undefined}>
							Open in Replit
						</Item>
						{/* <Item action={openInCodePen}>Open in CodePen</Item> */}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

function Item({
	action,
	children,
	rightContent,
}: {
	action: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void
	children: React.ReactNode
	rightContent?: React.ReactNode
}) {
	return (
		<DropdownMenu.Item asChild>
			<button
				onPointerDown={stopEventPropagation}
				onClick={action}
				onTouchEnd={action}
				className=" hover:bg-gray-100 outline-none h-9 px-3 text-left w-full rounded-md box-border flex justify-between align-middle items-center gap-x-4"
				style={{
					textShadow: '1px 1px #fff',
				}}
			>
				{children}
				{rightContent}
			</button>
		</DropdownMenu.Item>
	)
}

function Spinner() {
	return (
		<svg
			className="animate-spin h-5 w-5"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="3"
			></circle>
			<path
				className="opacity-50"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	)
}
