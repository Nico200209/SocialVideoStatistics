import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        surfaceHover: '#242424',
        border: '#2a2a2a',
        borderLight: '#333333',
        textPrimary: '#f5f5f5',
        textSecondary: '#a0a0a0',
        textMuted: '#6b6b6b',
        accent: '#06b6d4',
        accentHover: '#0891b2',
        tiktokPink: '#ff0050',
        tiktokCyan: '#00f2ea',
        instagramPurple: '#833ab4',
        instagramPink: '#fd1d1d',
        instagramOrange: '#fcb045',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'instagram-gradient': 'linear-gradient(45deg, #fcb045, #fd1d1d, #833ab4)',
        'tiktok-gradient': 'linear-gradient(135deg, #ff0050, #00f2ea)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
