import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const storeUserValidator = vine.compile(
  vine.object({
    full_name: vine
      .string()
      .trim()
      .maxLength(100)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/),

    email: vine.string().trim().email().maxLength(255).unique({ table: 'users', column: 'email' }),

    date_of_birth: vine.date().optional(),

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
storeUserValidator.messagesProvider = new SimpleMessagesProvider(
  {
    // Messages génériques
    'required': 'Le champ {{ field }} est obligatoire',
    'string': 'Le champ {{ field }} doit être une chaîne de caractères',
    'email': 'Veuillez entrer une adresse email valide',
    'database.unique': 'Cette valeur est déjà utilisée',
    'maxLength': 'Le champ {{ field }} ne doit pas dépasser {{ max }} caractères',
    'minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} caractères',
    'regex': 'Le champ {{ field }} ne respecte pas le format requis',
    'confirmed': 'La confirmation du champ {{ field }} ne correspond pas',

    // Messages spécifiques
    'full_name.regex':
      'Le prénom ou le nom ne peut contenir que des lettres, espaces, tirets et apostrophes',
    'email.database.unique': 'Un compte existe déjà avec cet email',
    'password.regex':
      'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial',
  },
  {
    // Alias pour les noms de champs
    full_name: 'prénom et nom',
    email: 'adresse email',
    date_of_birth: 'date de naissance',
    password: 'mot de passe',
    password_confirmation: 'confirmation du mot de passe',
  }
)
