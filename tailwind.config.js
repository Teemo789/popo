module.exports = {
  darkMode: 'class', // Ajouter cette ligne
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#60A5FA',
        // Ajouter les couleurs pour le dark mode
        dark: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
        }
      }
    },
  },
  plugins: [],
}