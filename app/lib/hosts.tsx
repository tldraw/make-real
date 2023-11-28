const env =
	process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
		? 'production'
		: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
		? 'preview'
		: 'development'

export const LINK_HOST = {
	production: `${process.env.NEXT_PUBLIC_VERCEL_URL}`,
	preview: `${process.env.NEXT_PUBLIC_VERCEL_URL}`,
	development: 'makereal-link.localhost:3000',
}[env]

export const APP_HOST = {
	production: process.env.NEXT_PUBLIC_VERCEL_URL,
	preview: process.env.NEXT_PUBLIC_VERCEL_URL,
	development: 'localhost:3000',
}[env]

export const PROTOCOL = env === 'development' ? 'http://' : 'https://'
