/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 45px -10px rgba(14, 165, 233, 0.35)'
      }
    }
  },
  plugins: []
};
