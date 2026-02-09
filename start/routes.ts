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
const LikesController = () => import('#controllers/likes_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const FollowsController = () => import('#controllers/follows_controller')
const SearchController = () => import('#controllers/searches_controller')

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
      router.get('/search', [SearchController, 'search']).as('search')

      // 3. Route pour les notifications
      router.get('/notifications', [HomeController, 'notifications']).as('notifications')

      // 4. Routes profile
      // Route pour l'affichage du profil utilisateur
      router.get('/:username', [ProfilesController, 'showProfile']).as('show_profile')
      // Route pour l'affichage page d'édition du profil
      router.get('/settings/profile', [ProfilesController, 'editProfile']).as('edit_profile')
      // Route pour la mise à jour du profil
      router.put('/settings/profile', [ProfilesController, 'updateProfile']).as('update_profile')
      // Route pour suivre / ne plus suivre un utilisateur
      router.post('/users/:id/follow', [FollowsController, 'toggleFollow']).as('toggle_follow')
      // Route pour afficher la liste des abonnés / abonnements
      router.get('/users/:username/follow', [FollowsController, 'showFollow']).as('show_follow')
      // Route pour bloquer / débloquer un utilisateur
      router.post('/profiles/:id/block', [ProfilesController, 'toggleBlock']).as('toggle_block')
    })

    // Routes Tweets
    router.group(() => {
      //  1. Route pour modale poster, citer, repondre à un tweet
      router
        .get('/:username/tweets/:id/reply', [TweetsController, 'showReplyTweetForm'])
        .as('show_reply_tweet')

      // 1. Route pour poster un tweet
      router.post('/tweets', [TweetsController, 'storeTweet']).as('store_tweet')

      // 2. Route pour supprimer un tweet
      router.delete('/tweets/:id', [TweetsController, 'destroyTweet']).as('destroy_tweet')

      // 3.  Route pour liker/unliker un tweet
      router.post('/tweets/:id/like', [LikesController, 'toggleLike']).as('tweet_like')
      // 4. Route pour afficher un tweet spécifique
      router.get('/:username/tweets/:id', [TweetsController, 'showTweet']).as('show_tweet')
    })
  })
  .use([middleware.auth(), middleware.emailVerified()])
