import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				navy: {
					DEFAULT: 'hsl(var(--navy))',
					secondary: 'hsl(var(--navy-secondary))',
					foreground: 'hsl(var(--navy-foreground))'
				},
				safety: {
					DEFAULT: 'hsl(var(--safety))',
					secondary: 'hsl(var(--safety-secondary))',
					light: 'hsl(var(--safety-light))'
				},
				quality: {
					DEFAULT: 'hsl(var(--quality))',
					secondary: 'hsl(var(--quality-secondary))',
					light: 'hsl(var(--quality-light))'
				},
				cost: {
					DEFAULT: 'hsl(var(--cost))',
					secondary: 'hsl(var(--cost-secondary))',
					light: 'hsl(var(--cost-light))'
				},
				delivery: {
					DEFAULT: 'hsl(var(--delivery))',
					secondary: 'hsl(var(--delivery-secondary))',
					light: 'hsl(var(--delivery-light))'
				},
				people: {
					DEFAULT: 'hsl(var(--people))',
					secondary: 'hsl(var(--people-secondary))',
					light: 'hsl(var(--people-light))'
				},
				status: {
					good: 'hsl(var(--status-good))',
					'good-light': 'hsl(var(--status-good-light))',
					caution: 'hsl(var(--status-caution))',
					'caution-light': 'hsl(var(--status-caution-light))',
					issue: 'hsl(var(--status-issue))',
					'issue-light': 'hsl(var(--status-issue-light))',
					future: 'hsl(var(--status-future))'
				},
				chart: {
					blue: 'hsl(var(--chart-blue))',
					'blue-light': 'hsl(var(--chart-blue-light))',
					red: 'hsl(var(--chart-red))',
					'red-light': 'hsl(var(--chart-red-light))',
					green: 'hsl(var(--chart-green))',
					purple: 'hsl(var(--chart-purple))',
					orange: 'hsl(var(--chart-orange))',
					target: 'hsl(var(--chart-target))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-header': 'var(--gradient-header)',
				'gradient-safety': 'var(--gradient-safety)',
				'gradient-quality': 'var(--gradient-quality)',
				'gradient-cost': 'var(--gradient-cost)',
				'gradient-delivery': 'var(--gradient-delivery)',
				'gradient-people': 'var(--gradient-people)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
