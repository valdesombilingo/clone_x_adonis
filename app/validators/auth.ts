import vine, { SimpleMessagesProvider } from '@vinejs/vine'
export const authenticateValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),

    password: vine.string(),
  })
)

// Définition des messages d'erreur personnalisés
authenticateValidator.messagesProvider = new SimpleMessagesProvider(
  {
    // Messages génériques
    required: 'Le champ {{ field }} est obligatoire',
    email: 'Veuillez entrer une adresse email valide',
  },
  {
    // Alias pour les noms de champs
    email: 'adresse email',
    password: 'mot de passe',
  }
)
