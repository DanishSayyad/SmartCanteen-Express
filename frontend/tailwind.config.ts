import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f0e2',
        ink: '#1f241f',
        card: '#fffaf2',
        mist: '#ede2ce',
        accent: '#bb5a2a',
        accentDark: '#8b3d18',
        moss: '#5f7054',
        pine: '#2d4338',
        sunrise: '#ffd28f',
        rose: '#c86f5a',
        danger: '#a13b2f',
        success: '#2e6b4a'
      },
      boxShadow: {
        soft: '0 24px 60px rgba(46, 34, 22, 0.12)',
        card: '0 16px 40px rgba(52, 38, 23, 0.08)'
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif']
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 40%), radial-gradient(circle at 80% 10%, rgba(255,210,143,0.3), transparent 30%), radial-gradient(circle at 50% 90%, rgba(95,112,84,0.12), transparent 28%)'
      }
    }
  },
  plugins: []
} satisfies Config;
