/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			black: '#2F2F2F',
			white: '#F0EEE9',
			primary: '#f49114',
		},
		extend: {
			animation: {
				"card-appear": "card-appear 500ms ease-in-out forwards",
				"carousell-in": 'carousell-in 500ms ease-in-out forwards',
				"carousell-out": 'carousell-out 500ms ease-in-out forwards',
			},
			keyframes: {
				"card-appear": {
					'0%': {
						transform: 'var(--card-start-transform)',
						opacity: 0
					},
					'100%': {
						transform: 'translate(0, 0)',
						opacity: 1
					}
				},
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
