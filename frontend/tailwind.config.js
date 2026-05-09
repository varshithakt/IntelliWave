/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#020617',
        panel: 'rgba(8, 18, 34, 0.72)',
        cyanwave: '#22d3ee',
        greenwave: '#22c55e',
        alert: '#f43f5e',
      },
      boxShadow: {
        neon: '0 0 28px rgba(34, 211, 238, 0.35)',
        green: '0 0 32px rgba(34, 197, 94, 0.42)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        scan: 'scan 4s linear infinite',
        drift: 'drift 9s ease-in-out infinite',
        pulseGlow: 'pulseGlow 1.8s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.55, filter: 'drop-shadow(0 0 10px rgba(34,211,238,.65))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 26px rgba(34,197,94,.9))' },
        },
      },
    },
  },
  plugins: [],
}
