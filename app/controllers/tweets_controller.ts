// app/controllers/tweets_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import Tweet from '#models/tweet'
import { createTweetValidator, updateTweetValidator } from '#validators/tweet'
import fs from 'node:fs/promises'

export default class TweetsController {
  async storeTweet({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Le payload contient maintenant l'objet file sous la clé mediaUrl
    const payload = await request.validateUsing(createTweetValidator)
    const file = payload.mediaUrl

    let finalPath = null

    if (file) {
      // 1. Générer un nom unique
      const fileName = `${cuid()}.${file.extname}`
      // 2. Déplacer le fichier dans le dossier public
      await file.move(app.makePath('public/uploads'), { name: fileName })
      // 3. Chemin relatif pour la base de données
      finalPath = `/uploads/${fileName}`
    }

    await Tweet.create({
      content: payload.content,
      mediaUrl: finalPath, // On écrase l'objet file par le string du chemin
      userId: user.id,
      parentId: payload.parentId,
      retweetId: payload.retweetId,
    })

    return response.redirect().toRoute('home')
  }

  /**
   * Mettre à jour un tweet (seulement si c’est le mien)
   */
  async updateTweet({ request, auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const tweet = await Tweet.findOrFail(params.id)

    if (tweet.userId !== user.id) {
      return response.forbidden({ error: 'Vous ne pouvez modifier que vos propres tweets.' })
    }

    const payload = await request.validateUsing(updateTweetValidator)
    tweet.merge(payload)
    await tweet.save()

    return response.redirect().toRoute('home')
  }

  /**
   * Timeline "Pour vous" → tous les tweets récents (optimisé)
   */
  // async timelineForYou({ view, request }: HttpContext) {
  //   const page = request.input('page', 1)
  //   const tweets = await Tweet.query()
  //     .preload('user')
  //     .orderBy('createdAt', 'desc')
  //     .paginate(page, 20)

  //   // Vérifiez bien que 'tweets' est écrit ici :
  //   return view.render('pages/home', { tweets })
  // }

  /**
   * Timeline "Abonnement" → tweets des comptes suivis (Haute Performance)
   */
  // async timelineFollowing({ auth, request }: HttpContext) {
  //   const user = auth.getUserOrFail()
  //   const page = request.input('page', 1)
  //   const limit = request.input('limit', 20)

  // Utilisation d'une sous-requête SQL pour éviter de charger des milliers d'IDs en mémoire JS
  //   return await Tweet.query()
  //     .whereIn('userId', (query) => {
  //       query.from('follows').select('following_id').where('follower_id', user.id)
  //     })
  //     .preload('user')
  //     .orderBy('createdAt', 'desc')
  //     .paginate(page, limit)
  // }

  /**
   * Voir les tweets d’un utilisateur (profil)
   */
  async userTweets({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    return await Tweet.query()
      .where('userId', params.userId)
      .preload('user')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Supprimer un tweet (sécurité + nettoyage fichier)
   */
  async destroyTweet({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const tweet = await Tweet.findOrFail(params.id)

    // Vérification de propriété (Sécurité)
    if (tweet.userId !== user.id) {
      session.flash('error', 'Action non autorisée.')
      return response.redirect().back()
    }

    // 1. Suppression du fichier physique s'il existe
    if (tweet.mediaUrl) {
      try {
        // app.makePath('public', tweet.mediaUrl) construit le chemin absolu
        // tweet.mediaUrl commence par /uploads/..., donc on le joint proprement
        const absolutePath = app.makePath('public', tweet.mediaUrl)
        await fs.unlink(absolutePath)
      } catch (error) {
        // On log l'erreur mais on continue pour ne pas bloquer la suppression en DB
        console.error('Erreur suppression fichier:', error.message)
      }
    }

    // 2. Suppression de l'entrée en base de données
    await tweet.delete()

    // 3. Retour avec message flash (typique du Web Starter)
    session.flash('success', 'Tweet supprimé avec succès.')
    return response.redirect().back()
  }

  /**
   * Répondre à un tweet
   */
  // async reply({ request, auth, params }: HttpContext) {
  //   const user = auth.getUserOrFail()
  // On s'assure que le tweet parent existe bien
  //   const parentTweet = await Tweet.findOrFail(params.id)

  //   const payload = await request.validateUsing(createTweetValidator)

  //   const reply = await Tweet.create({
  //     ...payload,
  //     parentId: parentTweet.id,
  //     userId: user.id,
  //   })

  //   return reply
  // }

  /**
   * Voir toutes les réponses sous un tweet
   */
  async replies({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    return await Tweet.query()
      .where('parentId', params.id)
      .preload('user')
      .orderBy('createdAt', 'asc')
      .paginate(page, limit)
  }
}
