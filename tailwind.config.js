/** @type {import('tailwindcss').Config} */
export default {
  content: ['./resources/views/**/*.edge', './resources/js/**/*.js', './resources/ts/**/*.ts'],

  // Activation du mode sombre via une classe (ex: <html class="dark">)
  darkMode: 'class',

  theme: {
    extend: {
      // Palette de couleurs personnalisée
      colors: {
        brand: {
          primary: '#1D9BF0', // bleu principal
          hoverPrimary: '#1B87D0', // bleu au survol
          secondary: '#657786', // gris bleuté secondaire
        },

        neutral: {
          dark: '#3A3B3B', // gris très foncé 4C4E4E
          gray: '#71767B', // gris standard
          light: '#DFDEDE', // gris clair
          lightBlue: '#E1E8ED', // gris bleuté clair
          offWhite: '#F3F4F6', // blanc cassé
        },

        background: {
          dark: '#000000', // noir profond
          light: '#FFFFFF', // blanc pur
        },

        state: {
          success: '#22c55e', // vert succès
          error: '#ef4444', // rouge erreur
          warning: '#facc15', // jaune vif avertissement
        },
      },

      // Polices personnalisées
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },

      // Échelle typographique (hiérarchie des tailles de texte)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }], // très petit texte
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // petit
        'base': ['1rem', { lineHeight: '1.5rem' }], // normal
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // légèrement grand
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // grand
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // très grand
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // gros titre
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // très gros titre
        '5xl': ['3rem', { lineHeight: '1' }], // énorme (3rem)
        '6xl': ['3.75rem', { lineHeight: '1' }], // encore plus grand
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // Poids de police personnalisés
      fontWeight: {
        thin: '100',
        extraLight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
        black: '900',
      },

      // Breakpoints (mobile first)
      screens: {
        'xs': '375px', // très petits écrans (iPhone SE, petits Android)
        'sm': '640px', // petits écrans
        'md': '768px', // tablettes
        'lg': '1024px', // laptops
        'xl': '1280px', // grands écrans
        '2xl': '1536px', // écrans ultra larges
      },
    },
  },

  // Plugins
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
