/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class", // Enables class-based dark mode
	theme: {
		extend: {
			fontFamily: {
				"Hammersmith One": ["Hammersmith One", "sans-serif"],
			},
			keyframes: {
				modalEntry: {
					"0%": { opacity: "0", transform: "scale(0.95) translateY(10px)" },
					"100%": { opacity: "1", transform: "scale(1) translateY(0)" },
				},
				slideIn: {
					"0%": { opacity: "0", transform: "translateX(100%)" },
					"100%": { opacity: "1", transform: "translateX(0)" },
				},
				slideOut: {
					"0%": { opacity: "1", transform: "translateX(0)" },
					"100%": { opacity: "0", transform: "translateX(100%)" },
				},
			},
			animation: {
				modalEntry: "modalEntry 0.3s ease-out forwards",
				"slide-in": "slideIn 0.3s ease-out forwards",
				"slide-out": "slideOut 0.3s ease-out forwards",
			},
		},
		screens: {
			sm: "640px", // Mobile
			md: "768px", // Tablet
			lg: "1024px", // Desktop
			xl: "1280px",
		},
	},
	plugins: [],
};
// sans: ['Poppins', 'sans-serif'],
// "Hammersmith One": ["Hammersmith One", "sans-serif"],
