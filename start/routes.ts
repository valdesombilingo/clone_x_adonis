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

// Pages d’inscription et de connexion (GET) et (POST)
router.on('/auth/signup').render('pages/auth/register').as('register').use(middleware.guest())
router.on('/auth/login').render('pages/auth/login').as('login').use(middleware.guest())

router.post('/auth/signup', [AuthController, 'storeUser']).as('store_user')
router.post('/auth/login', [AuthController, 'authenticate']).as('authenticate')

// Page de vérification d’email (accessible même connecté mais non vérifié)
router.on('/auth/verify-required').render('pages/auth/verify_required').as('verification_needed')

// Action pour renvoyer un mail de vérification
router
  .post('/auth/resend-verification', [AuthController, 'resendEmailVerification'])
  .as('resend_verification')

// Vérification d’email via le lien reçu
router
  .get('/verify-email/:token', [VerifyEmailsController, 'handleVerification'])
  .as('verify_email')

// Route de déconnexion apres connexion
router.post('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())

// Routes protégées (connexion et email validé obligatoire)
router
  .group(() => {
    router.get('/home', [HomeController, 'index']).as('home')
  })
  .use([middleware.auth(), middleware.emailVerified()])
