import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
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
                sans: ['Raleway', 'system-ui', 'sans-serif'],
                display: ['Cinzel', 'serif'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                // Sky CotL palette tokens
                midnight: {
                    50:  'oklch(0.95 0.02 270)',
                    100: 'oklch(0.88 0.04 270)',
                    200: 'oklch(0.75 0.06 270)',
                    300: 'oklch(0.60 0.08 270)',
                    400: 'oklch(0.45 0.09 270)',
                    500: 'oklch(0.35 0.09 270)',
                    600: 'oklch(0.28 0.08 270)',
                    700: 'oklch(0.22 0.07 270)',
                    800: 'oklch(0.17 0.05 270)',
                    900: 'oklch(0.13 0.04 270)',
                },
                amber: {
                    50:  'oklch(0.98 0.03 80)',
                    100: 'oklch(0.95 0.07 78)',
                    200: 'oklch(0.90 0.10 74)',
                    300: 'oklch(0.86 0.13 70)',
                    400: 'oklch(0.82 0.14 67)',
                    500: 'oklch(0.76 0.14 65)',
                    600: 'oklch(0.68 0.13 60)',
                    700: 'oklch(0.58 0.12 55)',
                    800: 'oklch(0.45 0.10 50)',
                    900: 'oklch(0.32 0.07 45)',
                },
                gold: {
                    50:  'oklch(0.98 0.04 90)',
                    100: 'oklch(0.95 0.08 88)',
                    200: 'oklch(0.92 0.11 88)',
                    300: 'oklch(0.88 0.13 88)',
                    400: 'oklch(0.84 0.14 88)',
                    500: 'oklch(0.80 0.14 86)',
                    600: 'oklch(0.72 0.13 82)',
                    700: 'oklch(0.60 0.11 78)',
                    800: 'oklch(0.46 0.09 72)',
                    900: 'oklch(0.32 0.06 65)',
                },
                indigo: {
                    50:  'oklch(0.96 0.03 285)',
                    100: 'oklch(0.90 0.07 285)',
                    200: 'oklch(0.82 0.11 285)',
                    300: 'oklch(0.72 0.15 285)',
                    400: 'oklch(0.62 0.18 285)',
                    500: 'oklch(0.55 0.18 285)',
                    600: 'oklch(0.46 0.16 285)',
                    700: 'oklch(0.38 0.13 285)',
                    800: 'oklch(0.28 0.09 285)',
                    900: 'oklch(0.20 0.06 285)',
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 12px)',
                '3xl': 'calc(var(--radius) + 20px)',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                amber: '0 0 24px oklch(0.76 0.14 65 / 0.25), 0 0 8px oklch(0.76 0.14 65 / 0.15)',
                gold: '0 0 32px oklch(0.84 0.14 88 / 0.3), 0 0 12px oklch(0.84 0.14 88 / 0.2)',
                indigo: '0 0 24px oklch(0.55 0.18 285 / 0.25), 0 0 8px oklch(0.55 0.18 285 / 0.15)',
                card: '0 4px 24px oklch(0.08 0.04 270 / 0.5)',
                celestial: '0 8px 32px oklch(0.08 0.04 270 / 0.6), inset 0 1px 0 oklch(0.76 0.14 65 / 0.15)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'float-up': {
                    '0%': { transform: 'translateY(0px) scale(1)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '0.6' },
                    '100%': { transform: 'translateY(-120px) scale(0.6)', opacity: '0' },
                },
                'cloud-drift-slow': {
                    '0%': { transform: 'translateX(-10%)' },
                    '100%': { transform: 'translateX(110%)' },
                },
                'cloud-drift-fast': {
                    '0%': { transform: 'translateX(-15%)' },
                    '100%': { transform: 'translateX(115%)' },
                },
                'light-ray-pulse': {
                    '0%, 100%': { opacity: '0.3', transform: 'scaleY(1)' },
                    '50%': { opacity: '0.6', transform: 'scaleY(1.05)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
                'fade-in': 'fade-in 0.4s ease-out',
                'float-up': 'float-up 6s ease-in-out infinite',
                'cloud-drift-slow': 'cloud-drift-slow 90s linear infinite',
                'cloud-drift-fast': 'cloud-drift-fast 60s linear infinite',
                'light-ray-pulse': 'light-ray-pulse 4s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
