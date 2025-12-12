import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class EmailVerifiedMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const auth = ctx.auth.use('web')

    // Vérifier si l'utilisateur est connecté
    const isAuthenticated = await auth.check()
    if (!isAuthenticated) {
      // Pas connecté, redirection vers login
      return ctx.response.redirect().toRoute('login')
    }

    const user = auth.user as User

    // Vérifier si l'email est validé
    if (!user.isEmailVerified) {
      // Email non vérifié, redirection vers la page de vérification
      ctx.session.flash({ error: 'Vous devez valider votre email pour accéder à cette page.' })
      return ctx.response.redirect().toRoute('verification_needed')
    }

    // Email vérifié, accès autorisé vers home
    await next()
  }
}
