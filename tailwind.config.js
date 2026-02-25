/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sidebar tokens
        sidebar: {
          bg: 'hsl(var(--sidebar-bg))',
          text: 'hsl(var(--sidebar-text))',
          'text-muted': 'hsl(var(--sidebar-text-muted))',
          border: 'hsl(var(--sidebar-border))',
          accent: 'hsl(var(--sidebar-accent))',
        },
        // Header tokens
        header: {
          bg: 'hsl(var(--header-bg))',
          text: 'hsl(var(--header-text))',
          'text-muted': 'hsl(var(--header-text-muted))',
        },
        // Content tokens
        content: {
          DEFAULT: 'hsl(var(--content-text))',
          bg: 'hsl(var(--content-bg))',
          muted: 'hsl(var(--content-text-muted))',
          border: 'hsl(var(--content-border))',
        },
        // Code/preview tokens
        code: {
          bg: 'hsl(var(--code-bg))',
        },
        preview: {
          bg: 'hsl(var(--preview-bg))',
        },
        // Card tokens
        card: {
          bg: 'hsl(var(--card-bg))',
          toolbar: 'hsl(var(--card-toolbar-bg))',
        },
        // Primary/link color
        primary: 'hsl(var(--link))',
        // Inline code
        'inline-code': {
          bg: 'hsl(var(--inline-code-bg))',
        },
        // Callout box tokens
        'box-info': {
          bg: 'hsl(var(--box-info-bg))',
          border: 'hsl(var(--box-info-border))',
        },
        'box-success': {
          bg: 'hsl(var(--box-success-bg))',
          border: 'hsl(var(--box-success-border))',
        },
        'box-warning': {
          bg: 'hsl(var(--box-warning-bg))',
          border: 'hsl(var(--box-warning-border))',
        },
        'box-yellow': {
          bg: 'hsl(var(--box-yellow-bg))',
          border: 'hsl(var(--box-yellow-border))',
        },
        // Table
        'table-row-alt': 'hsl(var(--table-row-alt))',
        // Ring offset
        'ring-offset': 'hsl(var(--ring-offset))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}
