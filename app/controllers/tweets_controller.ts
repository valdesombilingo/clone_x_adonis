// app/controllers/tweets_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import Tweet from '#models/tweet'
import { createTweetValidator, updateTweetValidator } from '#validators/tweet'
import fs from 'node:fs/promises'
import db from '@adonisjs/lucid/services/db'

/**
 * Contrôleur de tweets (CRUD) :
 * - Création et réponse (storeTweet)
 * - Voir un tweet (showTweet)
 * - Voir la page reply (showReplyTweetForm)
 * - Supprimer un tweet (destroyTweet)
 */

export default class TweetsController {
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

    await Tweet.create({
      content: payload.content,
      mediaUrl: finalPath,
      userId: user.id,
      parentId: payload.parentId,
      retweetId: payload.retweetId,
    })

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

    const tweet = await Tweet.query()
      .where('id', params.id)
      .preload('user')
      .preload('parent', (query) => {
        query.preload('user')
      })
      .preload('replies', (query) => {
        query
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
      .firstOrFail()

    // État du tweet principal
    tweet.isLiked = Boolean(tweet.$extras.is_liked)

    // État pour chaque réponse (pour que l'icône change de couleur)
    tweet.replies.forEach((reply) => {
      reply.isLiked = Boolean(reply.$extras.is_liked)
    })

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

  async destroyTweet({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const tweet = await Tweet.findOrFail(params.id)

    if (tweet.userId !== user.id) {
      session.flash('error', 'Action non autorisée.')
      return response.redirect().back()
    }

    // 1. On stocke l'ID du parent et l'utilisateur du parent AVANT de supprimer
    if (tweet.parentId) {
      await tweet.load('parent', (query) => query.preload('user'))
    }

    const parent = tweet.parent
    const mediaUrl = tweet.mediaUrl

    // 2. Suppression physique
    if (mediaUrl) {
      const absolutePath = app.publicPath(
        mediaUrl.startsWith('/') ? mediaUrl.substring(1) : mediaUrl
      )
      try {
        await fs.unlink(absolutePath)
      } catch (e) {}
    }

    // 3. Suppression en base
    await tweet.delete()

    // 4. Redirection intelligente
    if (parent && parent.user) {
      // Si c'est une réponse, on retourne sur le tweet qui était au-dessus
      return response.redirect().toRoute('show_tweet', {
        username: parent.user.userName,
        id: parent.id,
      })
    } else {
      // Si c'est un post principal (ou si le parent est introuvable), retour à l'accueil
      return response.redirect().toRoute('home')
    }
  }
}
