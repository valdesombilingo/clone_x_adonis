import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),

    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/)
      .confirmed(),

    password_confirmation: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/),
  })
)

// Définition des messages d'erreur personnalisés
resetPasswordValidator.messagesProvider = new SimpleMessagesProvider(
  {
    // Messages génériques
    'required': 'Le champ {{ field }} est obligatoire',
    'maxLength': 'Le champ {{ field }} ne doit pas dépasser {{ max }} caractères',
    'minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} caractères',
    'regex': 'Le champ {{ field }} ne respecte pas le format requis',
    'confirmed': 'La confirmation du champ {{ field }} ne correspond pas',

    // Messages spécifiques
    'password.regex':
      'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial',
  },
  {
    // Alias pour les noms de champs
    password: 'mot de passe',
    password_confirmation: 'confirmation du mot de passe',
  }
)
