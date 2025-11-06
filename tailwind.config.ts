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
	spacing: {
		px: '1px',
		0: '0',
		1: '4px',
		2: '8px',
		3: '12px',
		4: '16px',
		5: '20px',
		6: '24px',
		8: '32px',
		10: '40px',
		12: '48px',
		16: '64px',
		20: '80px',
		24: '96px',
		30: '120px',
		40: '160px',
		// Semantic spacing tokens
		'xs': 'var(--spacing-xs)',
		'sm': 'var(--spacing-sm)',
		'md': 'var(--spacing-md)',
		'lg': 'var(--spacing-lg)',
		'xl': 'var(--spacing-xl)',
		'section': 'var(--spacing-section)',
	},
		maxWidth: {
			'container': '1440px',
		},
			colors: {
				// B2B Color Scales
				darkpurple: {
					30: 'hsl(var(--color-darkpurple-30))',
					40: 'hsl(var(--color-darkpurple-40))',
					50: 'hsl(var(--color-darkpurple-50))',
					60: 'hsl(var(--color-darkpurple-60))',
					70: 'hsl(var(--color-darkpurple-70))',
					80: 'hsl(var(--color-darkpurple-80))',
					90: 'hsl(var(--color-darkpurple-90))',
					100: 'hsl(var(--color-darkpurple-100))',
				},
				purple: {
					30: 'hsl(var(--color-purple-30))',
					40: 'hsl(var(--color-purple-40))',
					50: 'hsl(var(--color-purple-50))',
					60: 'hsl(var(--color-purple-60))',
					70: 'hsl(var(--color-purple-70))',
					80: 'hsl(var(--color-purple-80))',
					90: 'hsl(var(--color-purple-90))',
				},
				raspberry: {
					30: 'hsl(var(--color-raspberry-30))',
					40: 'hsl(var(--color-raspberry-40))',
					50: 'hsl(var(--color-raspberry-50))',
					60: 'hsl(var(--color-raspberry-60))',
					70: 'hsl(var(--color-raspberry-70))',
					80: 'hsl(var(--color-raspberry-80))',
				},
				coral: {
					40: 'hsl(var(--color-coral-40))',
					50: 'hsl(var(--color-coral-50))',
					60: 'hsl(var(--color-coral-60))',
				},
				bone: {
					10: 'hsl(var(--color-bone-10))',
					20: 'hsl(var(--color-bone-20))',
					30: 'hsl(var(--color-bone-30))',
					40: 'hsl(var(--color-bone-40))',
					50: 'hsl(var(--color-bone-50))',
					60: 'hsl(var(--color-bone-60))',
					70: 'hsl(var(--color-bone-70))',
					80: 'hsl(var(--color-bone-80))',
					90: 'hsl(var(--color-bone-90))',
				},
				// Shadcn Semantic Colors
				border: 'hsl(var(--border))',
				input: {
					DEFAULT: 'hsl(var(--input))',
					foreground: 'hsl(var(--input-foreground))'
				},
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
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
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--foreground))'
				}
			},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			// Canonical gradients - managed via CMS (color_tokens table)
			'gradient-primary': 'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))',
			'gradient-hero': 'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))',
			'gradient-sunset': 'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%), hsl(25 95% 63%))',
			'gradient-warmth': 'linear-gradient(135deg, hsl(266 85% 58%), hsl(321 59% 85%), hsl(25 95% 70%))',
			'gradient-ocean': 'linear-gradient(135deg, hsl(210 100% 50%), hsl(180 70% 45%), hsl(142 76% 50%))',
			'gradient-fire': 'linear-gradient(135deg, hsl(25 95% 53%), hsl(266 85% 58%))',
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
				},
				'gradient': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient': 'gradient 10s ease infinite',
				'fade-in': 'fade-in 0.4s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
