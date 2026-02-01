import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css',
        'resources/js/app.js',
        'resources/js/tweet_preview.js',
        'resources/js/emoji_picker.js',
        'resources/js/profile_preview.js',
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})
