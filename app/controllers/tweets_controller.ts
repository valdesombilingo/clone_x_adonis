// app/controllers/tweets_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import Tweet from '#models/tweet'
import Hashtag from '#models/hashtag'
import User from '#models/user'
import Notification from '#models/notification'
import { createTweetValidator } from '#validators/tweet'
import fs from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'
import linkifyIt from 'linkify-it'
const linkify = new linkifyIt()
/**
 * Contrôleur de tweets :
 * - Affiche la page de création d'un tweet (createTweet)
 * - Création et réponse (storeTweet)
 * - Voir un tweet (showTweet)
 * - Voir la page reply (showReplyTweetForm)
 * - Supprimer un tweet (destroyTweet)
 */

export default class TweetsController {
  // =========================================================================
  // Affiche la page de création d'un tweet 'createTweet'
  // =========================================================================

  async createTweet({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    return view.render('pages/tweets/create', {
      user,
    })
  }

  // =========================================================================
  // Création d'un tweet ou d'une réponse 'storeTweet'
  // =========================================================================

  async storeTweet({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createTweetValidator)
    const file = request.file('mediaUrl')

    let finalPath = null

    if (file) {
      const fileName = `${cuid()}.${file.extname}`
      await file.move(app.makePath('public/uploads'), { name: fileName })
      finalPath = `/uploads/${fileName}`
    }

    // 1. On stocke l'instance du Tweet créé
    const tweet = await Tweet.create({
      content: payload.content,
      mediaUrl: finalPath,
      userId: user.id,
      parentId: payload.parentId,
      retweetId: payload.retweetId,
    })

    // 2. GESTION DES NOTIFICATIONS DE RÉPONSE
    if (payload.parentId) {
      const parentTweet = await Tweet.find(payload.parentId)
      if (parentTweet && parentTweet.userId !== user.id) {
        await Notification.create({
          userId: parentTweet.userId,
          notifierId: user.id,
          tweetId: tweet.id,
          type: 'REPLY',
        })
      }
    }

    // 3. Extraction des hashtags et mentions avec Linkify
    if (payload.content) {
      const matches = linkify.match(payload.content)

      // --- GESTION DES HASHTAGS ---
      if (matches) {
        const hashtagNames = matches
          .filter((m) => m.schema === '#')
          .map((m) => m.raw.slice(1).toLowerCase())

        if (hashtagNames.length > 0) {
          const uniqueNames = [...new Set(hashtagNames)]
          const hashtagIds: number[] = []

          for (const name of uniqueNames) {
            const hashtag = await Hashtag.firstOrCreate({ name }, { name })
            hashtagIds.push(hashtag.id)
          }
          await tweet.related('hashtags').attach(hashtagIds)
        }
      }

      // --- GESTION DES MENTIONS (@) ---
      // Extrait tout ce qui commence par @ suivi de caractères alphanumériques
      const mentionMatches = payload.content.match(/@\w+/g)

      if (mentionMatches) {
        // 2. Retire le '@' de chaque match et on passe en minuscule pour éviter les erreurs de casse
        const namesToSearch = [
          ...new Set(mentionMatches.map((m) => m.replace('@', '').toLowerCase())),
        ]

        for (const name of namesToSearch) {
          // 3. Cherche l'utilisateur
          const mentionedUser = await User.query().whereRaw('LOWER(user_name) = ?', [name]).first()

          if (mentionedUser && mentionedUser.id !== user.id) {
            // 4. Création de la notification
            await Notification.create({
              userId: mentionedUser.id,
              notifierId: user.id,
              tweetId: tweet.id,
              type: 'MENTION',
            })
          }
        }
      }
    }

    // 5. Gestion de la redirection
    if (payload.parentId) {
      const parent = await Tweet.query().where('id', payload.parentId).preload('user').first()
      if (parent) {
        return response.redirect().toRoute('show_tweet', {
          username: parent.user.userName,
          id: parent.id,
        })
      }
    }

    return response.redirect().toRoute('home')
  }

  // =========================================================================
  // Voir un tweet spécifique 'showTweet'
  // =========================================================================

  async showTweet({ params, response, view, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    // 1. RÉCUPÉRATION DU TWEET PRINCIPAL AVEC VÉRIFICATION
    const tweet = await Tweet.query()
      .where('id', params.id)
      .preload('user')
      .preload('parent', (query) => {
        query.preload('user')
      })
      .preload('replies', (query) => {
        query
          .where((replyQuery) => {
            replyQuery
              .whereIn('user_id', (sub) => {
                sub.from('users').select('id').where('is_private', false)
              })
              .orWhere('user_id', user.id)
              .orWhereIn('user_id', (sub) => {
                sub
                  .from('follows')
                  .select('following_id')
                  .where('follower_id', user.id)
                  .where('is_accepted', true)
              })
          })
          .preload('user')
          .orderBy('createdAt', 'desc')
          .select('*')
          .select(
            db.raw(
              '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
              [user.id]
            )
          )
      })
      .select('*')
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
          [user.id]
        )
      )
      .first()

    if (!tweet) {
      return response.redirect().toRoute('home')
    }

    // 2.VÉRIFIE SI DROIT DE VOIR LE TWEET
    const isAuthor = tweet.userId === user.id
    const isPublic = !tweet.user.isPrivate
    const isFollowerAccepted = await db
      .from('follows')
      .where('follower_id', user.id)
      .where('following_id', tweet.userId)
      .where('is_accepted', true)
      .first()

    if (!isPublic && !isAuthor && !isFollowerAccepted) {
      return response.redirect().toRoute('show_profile', { username: tweet.user.userName })
    }

    // État du tweet principal
    tweet.isLiked = Boolean(tweet.$extras.is_liked)

    // État pour chaque réponse (pour que l'icône change de couleur)
    tweet.replies.forEach((reply) => {
      reply.isLiked = Boolean(reply.$extras.is_liked)
    })

    // Redirection si l'username dans l'URL ne correspond pas
    if (tweet.user.userName !== params.username) {
      return response.redirect().toRoute('show_tweet', {
        username: tweet.user.userName,
        id: tweet.id,
      })
    }

    return view.render('pages/tweets/show_tweet', { tweet })
  }

  // =========================================================================
  // Voir le formulaire de réponse 'showReplyTweetForm'
  // =========================================================================

  async showReplyTweetForm({ params, view, response }: HttpContext) {
    const tweet = await Tweet.query().where('id', params.id).preload('user').firstOrFail()

    if (tweet.user.userName !== params.username) {
      return response.redirect().toRoute('show_reply_tweet', {
        username: tweet.user.userName,
        id: tweet.id,
      })
    }

    return view.render('pages/tweets/reply', { tweet })
  }

  // =========================================================================
  // Supprimer un tweet 'destroyTweet'
  // =========================================================================

  async destroyTweet({ params, auth, response, session, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const tweet = await Tweet.findOrFail(params.id)

    if (tweet.userId !== user.id) {
      session.flash('error', 'Action non autorisée.')
      return response.redirect().back()
    }

    // 1. Récuperation des infos du parent avant de supprimer
    await tweet.load('parent', (q) => q.preload('user'))
    const parent = tweet.parent
    const mediaUrl = tweet.mediaUrl

    // 2. Suppression physique du fichier
    if (mediaUrl) {
      const absolutePath = app.publicPath(
        mediaUrl.startsWith('/') ? mediaUrl.substring(1) : mediaUrl
      )
      try {
        await fs.unlink(absolutePath)
      } catch (e) {
        // Ne rien faire si le fichier n'existe pas
      }
    }

    // 3. Suppression en base de données
    await tweet.delete()

    // 4. Redirection intelligente
    session.flash('success', 'Tweet supprimé.')

    // Cas A : On est sur un profil (on y reste)
    const referer = request.header('referer') || ''
    if (referer.includes(`/${user.userName}`)) {
      return response.redirect().back()
    }

    // Cas B : Suppression une réponse dans la vue détail d'un tweet
    if (parent) {
      return response.redirect().toRoute('show_tweet', {
        username: parent.user.userName,
        id: parent.id,
      })
    }

    // Cas C : Par défaut, retour à l'accueil
    return response.redirect().toRoute('home')
  }
}
