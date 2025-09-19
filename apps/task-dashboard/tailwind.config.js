/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './apps/task-dashboard/src/**/*.{html,ts,tsx,js,jsx}',
    './apps/**/*.{html,ts,tsx,js,jsx}',
    './libs/**/*.{html,ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
