/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b2925',
        paper: '#f5f5f0',
        forest: '#193d32',
      },
      fontFamily: {
        display: ['Newsreader Variable', 'Newsreader', 'Georgia', 'serif'],
        body: ['DM Sans Variable', 'DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
