// database/seeders/main_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Tweet from '#models/tweet'
import Hashtag from '#models/hashtag'
import Follow from '#models/follow'
import Like from '#models/like'
import Block from '#models/block'

export default class extends BaseSeeder {
  async run() {
    // 1. CRÉATION DES HASHTAGS
    const tagRdc = await Hashtag.firstOrCreate({ name: 'rdc' })
    const tagTech = await Hashtag.firstOrCreate({ name: 'tech' })
    const tagKadea = await Hashtag.firstOrCreate({ name: 'KadeaAcademy' })
    const tagIa = await Hashtag.firstOrCreate({ name: 'ia' })

    // 2. CRÉATION DES PROFILS
    const kadea = await User.updateOrCreate(
      { email: 'kadea@gmail.com' },
      {
        fullName: 'Kadea Academy',
        userName: 'kadeaacademy',
        password: 'Admin_2026!',
        avatarUrl: 'kadea_profile.jpg',
        bannerImage: 'kadea_banner.jpg',
        bio: `Académie de développeurs web & mobile et spécialistes en marketing digital\n\nUne formation qui change une vie`,
        location: '63, Av Colonel Mondjibakadea',
        websiteUrl: 'https://www.kadea.academy',
        isEmailVerified: true,
      }
    )

    const vodacom = await User.updateOrCreate(
      { email: 'vodacom@gmail.com' },
      {
        fullName: 'Vodacom RDC',
        userName: 'vodacomrdc',
        password: 'Admin_2026!',
        avatarUrl: 'vodacom_profile.jpg',
        bannerImage: 'vodacom_banner.jpg',
        bio: 'Vodacom offre les services téléphoniques et internet à plus de 21.000.000 abonnés. Notre ambition est de démocratiser l’internet et le rendre accessible à tous.',
        location: 'Democratic Republic of Congo',
        websiteUrl: 'https://www.vodacom.cd',
        isEmailVerified: true,
      }
    )

    const valdes = await User.updateOrCreate(
      { email: 'valdes@gmail.com' },
      {
        fullName: 'Valdes Ombilingo',
        userName: 'valdesombilingo',
        password: 'Admin_2026!',
        avatarUrl: 'valdesombilingo_profile.jpg',
        bannerImage: 'valdesombilingo_banner.jpg',
        bio: 'Fullstack Developer | Passionné du Digital. 🚀\n#rdc #tech',
        location: 'Democratic Republic of Congo',
        websiteUrl: 'https://valdesombilingo.github.io/valdesombilingo-portfolio',
        isEmailVerified: true,
      }
    )

    const admin = await User.updateOrCreate(
      { email: 'admin@gmail.com' },
      {
        fullName: 'Admin Test',
        userName: 'admintest',
        password: 'Admin_2026!',
        isEmailVerified: true,
      }
    )

    const darkElon = await User.updateOrCreate(
      { email: 'darkelon@gmail.com' },
      {
        fullName: 'Dark Elon',
        userName: 'darkelon',
        password: 'Admin_2026!',
        avatarUrl: 'dark_elon_profile.jpg',
        bannerImage: 'dark_elon_banner.jpg',
        bio: 'Messager du futur, êtes-vous prêt ! 🤖 #ia',
        location: 'Sur mars',
        websiteUrl: 'https://x.com',
        isPrivate: true,
        isEmailVerified: true,
      }
    )

    // 3. RÉSEAU ET BLOCAGE
    await Follow.updateOrCreate(
      { followerId: valdes.id, followingId: darkElon.id },
      { isAccepted: true }
    )

    await Block.updateOrCreate({ blockerId: darkElon.id, blockedId: admin.id }, {})

    await Follow.updateOrCreate(
      { followerId: valdes.id, followingId: kadea.id },
      { isAccepted: true }
    )
    await Follow.updateOrCreate(
      { followerId: valdes.id, followingId: vodacom.id },
      { isAccepted: true }
    )
    await Follow.updateOrCreate(
      { followerId: valdes.id, followingId: admin.id },
      { isAccepted: true }
    )
    await Follow.updateOrCreate(
      { followerId: kadea.id, followingId: valdes.id },
      { isAccepted: true }
    )

    // 4. TWEETS & RÉPONSES

    // --- TWEET KADEA 1 ---
    const tweetKadeaVision = await Tweet.create({
      userId: kadea.id,
      content: `Chez Kadea Academy, notre vision est claire : propulser la jeunesse congolaise vers l'excellence numérique.\n\nNous formons les leaders tech de demain pour bâtir une économie digitale forte en RDC. Rejoignez le mouvement ! 🚀 #rdc #tech #kadeaacademy`,
    })
    await tweetKadeaVision.related('hashtags').attach([tagRdc.id, tagTech.id, tagKadea.id])

    // --- TWEET KADEA 2 ---
    const tweetKadeaNews = await Tweet.create({
      userId: kadea.id,
      content: `NOUVEAUTÉS 2025 : Kadea Academy enrichit son offre de formations ! 🎓\n\n✅ 95% de nos apprenants trouvent un emploi.\n✅ Financements disponibles pour tous les budgets.\n\nInscris-toi maintenant : https://bit.ly/_kadeaacademy #tech #RDC`,
      mediaUrl: 'kadea_pub.jpg',
    })
    await tweetKadeaNews.related('hashtags').attach([tagTech.id, tagRdc.id])

    // --- TWEET VALDES ---
    const tweetValdes = await Tweet.create({
      userId: valdes.id,
      content: 'Cohorte 2025 Dévéloppement Web ! Merci @kadeaacademy pour la formation. #rdc #tech',
      mediaUrl: 'valdesombilingo_cohorte.jpg',
    })
    await tweetValdes.related('hashtags').attach([tagRdc.id, tagTech.id])

    // --- TWEET VODACOM ---
    const tweetVodacom = await Tweet.create({
      userId: vodacom.id,
      content: `1 Go à seulement 1 $ ! 🤩\nRestez connectés pour découvrir nos prochaines offres internet. #rdc 🌐`,
      mediaUrl: 'vodacom_pub.mp4',
    })

    // 5. LIKES & INTERACTIONS
    await Like.firstOrCreate({ userId: valdes.id, tweetId: tweetKadeaNews.id })
    await Like.firstOrCreate({ userId: admin.id, tweetId: tweetKadeaNews.id })
    await Like.firstOrCreate({ userId: vodacom.id, tweetId: tweetKadeaVision.id })
    await Like.firstOrCreate({ userId: kadea.id, tweetId: tweetValdes.id })
    await Like.firstOrCreate({ userId: vodacom.id, tweetId: tweetValdes.id })
    await Like.firstOrCreate({ userId: valdes.id, tweetId: tweetVodacom.id })

    // 6. THREAD (Réponses)
    const replyKadea = await Tweet.create({
      userId: kadea.id,
      parentId: tweetValdes.id,
      content: 'Félicitations ! 👏',
    })

    await Tweet.create({
      userId: valdes.id,
      parentId: replyKadea.id,
      content: 'Merci ! Hâte de passer à la prochaine étape. 🔜',
    })

    await Tweet.create({
      userId: valdes.id,
      parentId: tweetKadeaNews.id,
      content: 'Je recommande vivement ! Cette formation a changé ma vie. 🔥',
    })

    // 7. TWEET DARK ELON
    const tweetElon = await Tweet.create({
      userId: darkElon.id,
      content: "L'ia va bientot nous remplacer. 🤖 #ia",
      mediaUrl: 'dark_elon_ia.mp4',
    })
    await tweetElon.related('hashtags').attach([tagIa.id, tagTech.id])

    await Tweet.create({
      userId: valdes.id,
      parentId: tweetElon.id,
      content: 'Les devs, eux, remplacent les bugs que l’IA crée 😌',
    })
  }
}
