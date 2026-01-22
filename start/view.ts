import edge from 'edge.js'
import { linkifyText } from '#services/linkify_service'

/**
 * On enregistre un helper global
 * Le premier argument est le nom que tu utiliseras dans Edge : 'linkify'
 */
edge.global('linkify', (text: string) => {
  // Si le texte est vide, on ne fait rien
  if (!text) return ''

  // On appelle la fonction de ton service que nous avons créé avant
  return linkifyText(text)
})
