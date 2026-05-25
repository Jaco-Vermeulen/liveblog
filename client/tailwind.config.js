/** Maroela admin portal — Tailwind 1.9 (Node 10 compatible; components are plain CSS in portal.css) */
module.exports = {
  important: '.maroela-portal',
  purge: [
    './app/**/*.{html,ng1,js,ts,tsx}',
    './app/template/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        mar: {
          page: '#f5efe7',
          orange: '#c45712',
          'orange-dark': '#a0450e',
          teal: '#157578',
          'teal-dark': '#0d4f52',
          accent: '#c8503a',
          text: '#1c1917',
          muted: '#57534e',
          meta: '#78716c',
          card: '#ffffff',
          border: '#e2dcd2',
          beige: '#f0e9df',
        },
      },
      fontFamily: {
        sans: ['Lato', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      screens: {
        nav: '1024px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
