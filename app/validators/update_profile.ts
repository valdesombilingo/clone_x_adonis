import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    avatar: vine.file({ size: '1mb', extnames: ['jpg', 'png', 'jpeg'] }).optional(),
    banner: vine.file({ size: '5mb', extnames: ['jpg', 'png', 'jpeg'] }).optional(),

    // Champs cachés pour gérer la suppression
    deleteAvatar: vine.boolean().optional(),
    deleteBanner: vine.boolean().optional(),

    fullName: vine
      .string()
      .trim()
      .maxLength(100)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/),

    email: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .unique(async (db, value, field) => {
        const user = await db
          .from('users')
          .whereNot('id', field.meta.userId)
          .where('email', value)
          .first()
        return !user
      })
      .optional(),

    bio: vine.string().trim().maxLength(160).nullable().optional(),
    location: vine.string().trim().maxLength(50).nullable().optional(),
    websiteUrl: vine.string().trim().url().nullable().optional(),

    currentPassword: vine.string().optional(),

    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/)
      .confirmed()
      .optional(),
  })
)

// Réutilisation et adaptation de tes messages d'erreur
updateProfileValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Le champ {{ field }} est obligatoire',
    'email': 'Veuillez entrer une adresse email valide',
    'database.unique': 'Cet email est déjà utilisé par un autre compte',
    'maxLength': 'Le champ {{ field }} ne doit pas dépasser {{ max }} caractères',
    'minLength': 'Le champ {{ field }} doit contenir au moins {{ min }} caractères',
    'regex': 'Format invalide',
    'confirmed': 'Les mots de passe ne correspondent pas',
    'url': 'Veuillez entrer une URL valide (ex: https://...)',

    'fullName.regex': 'Le nom ne peut contenir que des lettres, espaces et tirets',
    'password.regex':
      'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial',
  },
  {
    fullName: 'prénom et nom',
    email: 'adresse email',
    bio: 'biographie',
    location: 'localisation',
    websiteUrl: 'site web',
    password: 'mot de passe',
    currentPassword: 'mot de passe actuel',
  }
)
