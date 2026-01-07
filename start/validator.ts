import vine from '@vinejs/vine'
import { SimpleMessagesProvider } from '@vinejs/vine'

// Messages personnalisés
vine.messagesProvider = new SimpleMessagesProvider(
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
