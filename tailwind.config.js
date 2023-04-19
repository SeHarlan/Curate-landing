/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        "body": ['var(--font-body)', ...fontFamily.sans],
        "title": ['var(--font-title)', ...fontFamily.mono],
        "abril": ['var(--font-abril)', ...fontFamily.mono]
      },
      extend: {
        textShadow: {
          sm: '0 1px 2px var(--tw-shadow-color)',
          DEFAULT: '0 2px 4px var(--tw-shadow-color)',
          lg: '0 8px 16px var(--tw-shadow-color)',
        },
      },
      height: { screen: 'calc(var(--vh) * 100)' },
      maxHeight: { screen: 'calc(var(--vh) * 100)' },
      minHeight: { screen: 'calc(var(--vh) * 100)' },
    },
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ]
}
