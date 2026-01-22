import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const createTweetValidator = vine.compile(
  vine.object({
    content: vine.string().trim().maxLength(280).optional().requiredIfMissing('mediaUrl'),
    mediaUrl: vine
      .file({
        size: '50mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm'],
      })
      .optional()
      .requiredIfMissing('content')
      .nullable(),
    parentId: vine.number().positive().optional().nullable(),
    retweetId: vine.number().positive().optional().nullable(),
  })
)

export const updateTweetValidator = vine.compile(
  vine.object({
    content: vine.string().trim().maxLength(280).nullable(),
    mediaUrl: vine.string().url().nullable(),
    parentId: vine.number().positive().nullable(),
    retweetId: vine.number().positive().nullable(),
  })
)

// Définition des messages d'erreur personnalisés

const messages = {
  // Messages génériques
  'string': 'Le champ {{ field }} doit être une chaîne de caractères.',
  'file': 'Le format du {{ field }} est invalide.',
  'positive': 'Le champ {{ field }} doit être un nombre positif.',

  // Messages spécifiques
  'content.required': 'Vous devez rédiger un {{ field }} si vous ne publiez pas de média.',
  'mediaUrl.required': "Veuillez ajouter une {{ field }} si vous n'écrivez pas de texte.",
  'content.maxLength': 'Le champ {{ field }} ne doit pas dépasser {{ max }} caractères.',
  'content.requiredIfMissing': 'Vous devez fournir soit un texte, soit un média pour votre tweet.',
  'mediaUrl.requiredIfMissing': 'Un média est requis si le contenu textuel est vide.',
}

const fields = {
  content: 'texte',
  mediaUrl: 'image ou vidéo',
  parentId: 'ID du parent',
  retweetId: 'ID du retweet',
}

// Appliquer aux validateurs
createTweetValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateTweetValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
