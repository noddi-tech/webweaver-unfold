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
        sans: ['Atkinson Hyperlegible Next', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Atkinson Hyperlegible Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
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
		'container': '1440px',  // Full-bleed visuals (Hero images, feature cards)
		'content': '1152px',    // Default content width (most sections)
		'reading': '768px',     // Text-heavy content (paragraphs, descriptions)
	},
			colors: {
				// Navio Brand Color Scale
				'navio-blue': 'hsl(var(--primary))',
				'navio-purple': 'hsl(var(--vibrant-purple))',
				'navio-orange': 'hsl(var(--brand-orange))',
				'navio-pink': 'hsl(var(--brand-pink))',
				'navio-peach': 'hsl(var(--brand-peach))',
				'navio-ocean-blue': 'hsl(var(--brand-blue))',
				'navio-teal': 'hsl(var(--brand-teal))',
				'navio-green': 'hsl(var(--brand-green))',
				
				// Legacy B2B Color Scales (kept for backward compatibility)
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
				},
				// Comprehensive Text Color System
				'text-success': 'hsl(var(--text-success))',
				'text-error': 'hsl(var(--text-error))',
				'text-warning': 'hsl(var(--text-warning))',
				'text-info': 'hsl(var(--text-info))',
				'text-disabled': 'hsl(var(--text-disabled))',
				'text-placeholder': 'hsl(var(--text-placeholder))',
				'text-caption': 'hsl(var(--text-caption))',
				'text-link': 'hsl(var(--text-link))',
				'text-link-hover': 'hsl(var(--text-link-hover))',
				'text-code': 'hsl(var(--text-code))',
				'text-quote': 'hsl(var(--text-quote))'
			},
			textColor: {
				'success': 'hsl(var(--text-success))',
				'error': 'hsl(var(--text-error))',
				'warning': 'hsl(var(--text-warning))',
				'info': 'hsl(var(--text-info))',
				'disabled': 'hsl(var(--text-disabled))',
				'placeholder': 'hsl(var(--text-placeholder))',
				'link': 'hsl(var(--text-link))',
				'link-hover': 'hsl(var(--text-link-hover))',
				'code': 'hsl(var(--text-code))',
				'quote': 'hsl(var(--text-quote))',
				'destructive': 'hsl(var(--text-destructive))',
				'vibrant-purple': 'hsl(var(--text-vibrant-purple))',
				'brand-orange': 'hsl(var(--text-brand-orange))',
				'brand-teal': 'hsl(var(--text-brand-teal))',
			},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			
			// Navio Standard Gradients
			'gradient-primary': 'var(--gradient-primary)',
			'gradient-hero': 'var(--gradient-hero)',
			'gradient-sunset': 'var(--gradient-sunset)',
			'gradient-warmth': 'var(--gradient-warmth)',
			'gradient-ocean': 'var(--gradient-ocean)',
			'gradient-fire': 'var(--gradient-fire)',
			
			// Navio Experimental Mesh Gradients
			'gradient-mesh-aurora': 'var(--gradient-mesh-aurora)',
			'gradient-mesh-sunset': 'var(--gradient-mesh-sunset)',
			'gradient-mesh-ocean': 'var(--gradient-mesh-ocean)',
			'gradient-mesh-dream': 'var(--gradient-mesh-dream)',
			'gradient-mesh-cosmic': 'var(--gradient-mesh-cosmic)',
			'gradient-mesh-velvet': 'var(--gradient-mesh-velvet)',
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
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient': 'gradient 10s ease infinite',
				'fade-in': 'fade-in 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
