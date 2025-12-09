import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}', // 경로 수정
  ],
  darkMode: 'class', // darkMode 설정 추가
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
