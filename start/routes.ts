/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

//Route d'affichage (Landing Page)
router.on('/').render('pages/landing').as('landing')

// === Routes de Traitement (POST) ===

// Traitement de l'inscription (envoie des données depuis la modal)
router.post('/auth/signup', [AuthController, 'storeUser']).as('store_user')

// Traitement de la connexion (envoie des données depuis la modal)
router.post('/auth/login', [AuthController, 'authenticate']).as('authenticate')
