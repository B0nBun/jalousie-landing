/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			black: '#212121',
			white: '#ffffff',
			primary: '#F9E547'
		},
		extend: {
			animation: {
				"carousell-in": 'carousell-in 300ms ease-in-out forwards',
				"carousell-out": 'carousell-out 300ms ease-in-out forwards',
			},
			keyframes: {
				"carousell-in": {
					'0%': {
						transform: 'translateX(var(--carousell-translate))',
						opacity: 0
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: 1
					}
				},
				"carousell-out": {
					'0%': {
						transform: 'translateX(0)',
						opacity: 1
					},
					'100%': {
						transform: 'translateX(calc(-1 * var(--carousell-translate)))',
						opacity: 0
					}
				}
			}
		},
	},
	plugins: [],
}
