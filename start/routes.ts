/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const VerifyEmailsController = () => import('#controllers/verify_emails_controller')
const HomeController = () => import('#controllers/home_controller')

// Route d'affichage (Landing Page)
router.on('/').render('pages/landing').as('landing').use(middleware.guest())

// Page d’inscription et de connexion
router
  .group(() => {
    router.on('/signup').render('pages/auth/register').as('register')
    router.on('/login').render('pages/auth/login').as('login')

    router.post('signup', [AuthController, 'storeUser']).as('store_user')
    router.post('login', [AuthController, 'authenticate']).as('authenticate')
  })
  .use(middleware.guest())

// Page de vérification d’email (accessible uniquement aux comptes non vérifiés)
router
  .on('/verify-required')
  .render('pages/auth/verify_required')
  .as('verification_needed')
  .use(middleware.guest())

// Action pour renvoyer un mail de vérification
router
  .post('resend-verification', [AuthController, 'resendEmailVerification'])
  .as('resendVerification')
  .use(middleware.guest())

// Vérification d’email via le lien reçu
router.get('verify-email/:token', [VerifyEmailsController, 'handleVerification']).as('verifyEmail')

// Routes protégées (connexion et email validé obligatoire)
router
  .group(() => {
    router.get('/home', [HomeController, 'index']).as('home')
  })
  .use([middleware.auth(), middleware.emailVerified()])
