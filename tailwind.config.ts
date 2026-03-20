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
        // Paleta MetalApp Pro
        brand: {
          navy:  '#0B1F3A',
          blue:  '#1A4B8C',
          accent:'#1E6AC8',
          steel: '#4A7BB5',
          teal:  '#2DD4BF',
          light: '#F7FAFF',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
