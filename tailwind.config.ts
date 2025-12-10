import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          card: '#0A0A0A',
          input: '#111111'
        },
        border: {
          DEFAULT: '#1A1A1A',
          focus: '#333333'
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#888888',
          muted: '#666666'
        },
        accent: {
          primary: '#5E5CE6',
          success: '#34D399',
          error: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
} satisfies Config;
