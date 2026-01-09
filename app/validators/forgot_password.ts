import vine, { SimpleMessagesProvider } from '@vinejs/vine'
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

// Définition des messages d'erreur personnalisés
forgotPasswordValidator.messagesProvider = new SimpleMessagesProvider(
  {
    // Messages génériques
    required: 'Le champ {{ field }} est obligatoire',
    email: 'Veuillez entrer une adresse email valide',
  },
  {
    // Alias pour les noms de champs
    email: 'adresse email',
  }
)
