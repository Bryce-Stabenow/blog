/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'theme-body': 'var(--theme-body)',
				'theme-sidebar': 'var(--theme-sidebar)',
				'theme-main': 'var(--theme-main)',
				'theme-accent': 'var(--theme-accent)',
				'theme-accent-hover': 'var(--theme-accent-hover)',
				'theme-text': 'var(--theme-text)',
				'theme-text-secondary': 'var(--theme-text-secondary)',
				'theme-card-hover': 'var(--theme-card-hover)',
				'theme-border-btn': 'var(--theme-border-btn)',
				'theme-icon-idle': 'var(--theme-icon-idle)',
			},
		},
	},
	plugins: [],
}
