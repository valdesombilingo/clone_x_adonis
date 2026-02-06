import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Tweet from '#models/tweet'
import db from '@adonisjs/lucid/services/db'
import { updateProfileValidator } from '#validators/update_profile'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import hash from '@adonisjs/core/services/hash'

export default class ProfilesController {
  async showProfile({ params, auth, view, request, session }: HttpContext) {
    const authUser = auth.getUserOrFail()

    // 1. DÉFINITION DE L'ONGLET
    const tab = session.flashMessages.get('activeTab') || request.input('tab', 'posts')

    // 2. RÉCUPÉRATION DU PROFIL
    const profileUser = await User.query()
      .where('userName', params.username)
      .withCount('tweets')
      .withCount('followers')
      .withCount('following')
      // Vérifie que ces noms 'followers' et 'following' sont identiques au modèle
      .preload('followers', (q) => q.where('followerId', authUser.id))
      .preload('following', (q) => q.where('followingId', authUser.id))
      .firstOrFail()

    // Injection de l'info de suivi pour Edge
    profileUser.$extras.isFollowing = (profileUser.followers?.length || 0) > 0
    profileUser.$extras.followsYou = (profileUser.following?.length || 0) > 0

    // 3. PRÉPARATION DE LA REQUÊTE DES TWEETS
    const tweetsQuery = Tweet.query()
      .preload('user')
      .preload('parent', (q) => q.preload('user'))
      .withCount('replies')
      .withCount('likes')
      .select('*')
      .select(
        db.raw(
          '(SELECT EXISTS (SELECT 1 FROM likes WHERE tweet_id = tweets.id AND user_id = ?)) as is_liked',
          [authUser.id]
        )
      )
      .orderBy('createdAt', 'desc')
      .limit(500)

    // 4. LOGIQUE DE FILTRAGE
    if (tab === 'posts') {
      tweetsQuery.where('userId', profileUser.id).whereNull('parentId')
    } else if (tab === 'replies') {
      tweetsQuery.where('userId', profileUser.id).whereNotNull('parentId')
      // Le preload parent est déjà fait globalement au-dessus
    } else if (tab === 'likes') {
      tweetsQuery.whereIn('id', (q) =>
        q.from('likes').select('tweet_id').where('user_id', profileUser.id)
      )
    }

    const tweets = await tweetsQuery
    tweets.forEach((t) => (t.isLiked = Boolean(t.$extras.is_liked)))

    return view.render('pages/profiles/show', {
      user: profileUser,
      tweets,
      tab,
    })
  }

  // ---------------------------------------------------------
  async editProfile({ view, auth }: HttpContext) {
    // On récupère l'utilisateur connecté via le middleware auth
    const user = auth.getUserOrFail()

    // On retourne la vue sans infos dans l'URL
    return view.render('pages/profiles/edit', { user })
  }

  // ---------------------------------------------------------

  async updateProfile({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    try {
      const payload = await request.validateUsing(updateProfileValidator, {
        meta: { userId: user.id },
      })

      const { avatar, banner, deleteAvatar, deleteBanner, currentPassword, ...data } = payload

      // 1. VÉRIFICATION DE SÉCURITÉ
      const isChangingSensitive =
        (payload.email && payload.email !== user.email) || !!payload.password

      // On déclenche la vérification
      if (isChangingSensitive || currentPassword) {
        // Cas 1 : Modification sensible tentée mais le champ "mot de passe actuel" est vide
        if (isChangingSensitive && !currentPassword) {
          session.flash(
            'error',
            'Le mot de passe actuel est requis pour modifier les paramètres de votre compte.'
          )
          return response.redirect().back()
        }

        // Cas 2 : Le champ "mot de passe actuel" est rempli
        if (currentPassword) {
          const isPasswordValid = await hash.verify(user.password, currentPassword)

          if (!isPasswordValid) {
            session.flash('error', 'Le mot de passe actuel est incorrect.')
            session.flash('errors.currentPassword', 'Incorrect')
            return response.redirect().back()
          }
        }
      }

      // 2. TRAITEMENT DES FICHIERS (Avatar / Banner)
      if (deleteAvatar && user.avatarUrl) {
        await this.removeFile(user.avatarUrl)
        user.avatarUrl = null
      }
      if (avatar) {
        if (user.avatarUrl) await this.removeFile(user.avatarUrl)
        const fileName = `${Date.now()}-${user.id}-avatar.${avatar.extname}`
        await avatar.move(app.publicPath('uploads'), { name: fileName })
        user.avatarUrl = `/uploads/${fileName}`
      }

      if (deleteBanner && user.bannerImage) {
        await this.removeFile(user.bannerImage)
        user.bannerImage = null
      }
      if (banner) {
        if (user.bannerImage) await this.removeFile(user.bannerImage)
        const fileName = `${Date.now()}-${user.id}-banner.${banner.extname}`
        await banner.move(app.publicPath('uploads'), { name: fileName })
        user.bannerImage = `/uploads/${fileName}`
      }

      // 3. PRÉPARATION ET LOGIQUE USERNAME
      const updateData: Partial<User> & { userName?: string } = { ...data }

      if (data.fullName && data.fullName !== user.fullName) {
        const baseUsername = User.createBaseUsername(data.fullName)
        user.userName = await User.generateUniqueUsername(baseUsername, user.id)
      }

      // 4. SAUVEGARDE
      user.merge(updateData)

      // On vérifie si des changements ont été détectés (avant de sauvegarder)
      const hasChanges = user.$isDirty

      if (hasChanges) {
        await user.save()
        session.flash('success', 'Profil mis à jour.')
      }
      return response.redirect().toRoute('show_profile', { username: user.userName })
    } catch (error) {
      if (error.status === 422) {
        session.flashValidationErrors(error)
      } else {
        session.flash('error', 'Une erreur inattendue est survenue. Veuillez réessayer.')
      }
      return response.redirect().back()
    }
  }

  // --- HELPERS ---

  private async removeFile(fileUrl: string) {
    if (!fileUrl || fileUrl.startsWith('http')) return
    try {
      const filePath = app.publicPath(fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl)
      await fs.unlink(filePath)
    } catch {}
  }
}
