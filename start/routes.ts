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
const PasswordResetsController = () => import('#controllers/password_resets_controller')
const HomeController = () => import('#controllers/home_controller')
const TweetsController = () => import('#controllers/tweets_controller')

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

// Routes "Mot de passe oublié"
router
  .group(() => {
    // 1. Demande initiale
    router
      .get('/forgot-password', [PasswordResetsController, 'showForgotPasswordForm'])
      .as('show_forgot_password')

    router
      .post('/forgot-password', [PasswordResetsController, 'forgotPassword'])
      .as('forgot_password')

    // 2. Formulaire de nouveau mot de passe (via le lien du mail)
    router
      .get('/reset-password/:token', [PasswordResetsController, 'showResetPasswordForm'])
      .as('show_reset_password')

    // 3. Action de mise à jour en base
    router.post('/reset-password', [PasswordResetsController, 'resetPassword']).as('reset_password')
  })
  .use(middleware.guest())

// Routes protégées (connexion et email validé obligatoire)
router
  .group(() => {
    // Route de navigation
    router.group(() => {
      // 1. Route home, accueil
      router.get('/home', [HomeController, 'index']).as('home')

      // 2. Route pour les recherches d'utilisateurs et hashtags
      router.get('/search', [HomeController, 'search']).as('search')

      // 3. Route pour les notifications
      router.get('/notifications', [HomeController, 'notifications']).as('notifications')

      // 4. Route pour l'affichage du profil utilisateur
      router.get('/profile', [HomeController, 'profile']).as('show_profile')
    })

    // Routes Tweets
    router.group(() => {
      // 1. Route pour poster un tweet
      router.post('/tweets', [TweetsController, 'storeTweet']).as('store_tweet')

      // 2. Route pour supprimer un tweet
      router.delete('/tweets/:id', [TweetsController, 'destroyTweet']).as('destroy_tweet')
    })
  })
  .use([middleware.auth(), middleware.emailVerified()])
