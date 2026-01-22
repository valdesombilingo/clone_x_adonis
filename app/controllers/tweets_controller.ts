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
      mediaUrl: finalPath,
      userId: user.id,
      parentId: payload.parentId,
      retweetId: payload.retweetId,
    })

    return response.redirect().toRoute('home')
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
        const absolutePath = app.makePath('public', tweet.mediaUrl)
        await fs.unlink(absolutePath)
      } catch (error) {
        console.error('Erreur suppression fichier:', error.message)
      }
    }

    // 2. Suppression de l'entrée en base de données
    await tweet.delete()

    // 3. Retour avec message flash (typique du Web Starter)
    session.flash('success', 'Tweet supprimé avec succès.')
    return response.redirect().back()
  }
}
