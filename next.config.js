/** @type {import('next').NextConfig} */
const nextConfig = {
	functions: {
		'app/makereal.tldraw.com/api/**/*': {
			maxDuration: 120, // All functions can run for a maximum of 120 seconds
		},
	},
}

module.exports = nextConfig
