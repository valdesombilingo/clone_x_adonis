//  NOTE : Ce service transforme le contenu des tweets en HTML interactif pour les lien, mention, hashtag, etc.

import linkifyHtml from 'linkify-html'
import 'linkify-plugin-hashtag'
import 'linkify-plugin-mention'

export function linkifyText(text: string): string {
  // 1. Styles
  const options = {
    nl2br: true,
    className: 'text-brand-primary hover:underline',

    // Permet le clic Unpoly sur les liens (ex: #hashtag ou @mention) sans recharger la page
    attributes: {
      'up-follow': 'true',
      'up-target': '#main-content',
      'up-history': 'true',
    },

    // 2. Raccourcir affichage URLs trop longues (ex: https://site.com...)
    format: (value: string, type: string) => {
      if (type === 'url' && value.length > 30) {
        return value.substring(0, 30) + '…'
      }
      return value
    },

    // 3. Configuration des liens personnalisés
    formatHref: {
      hashtag: (val: string) => `/search?q=${encodeURIComponent(val.substring(1))}&tab=hashtags`,
      // Changer pour pointer vers /search avec l'onglet 'accounts'
      mention: (val: string) => `/search?q=${encodeURIComponent(val.substring(1))}&tab=accounts`,
    },

    // 4. URLs classiques, ouvrir dans un nouvel onglet
    target: {
      url: '_blank',
    },
  }

  // 5. Utilisation directe de la fonction importée
  return linkifyHtml(text, options)
}
