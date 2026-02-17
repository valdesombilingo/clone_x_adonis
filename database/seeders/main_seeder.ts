// database/seeders/main_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Tweet from '#models/tweet'
import Hashtag from '#models/hashtag'

export default class extends BaseSeeder {
  async run() {
    // 1. CRÉATION DES PROFILS
    const kadea = await User.updateOrCreate(
      { email: 'kadea@gmail.com' },
      {
        fullName: 'Kadea Academy',
        userName: 'kadeaacademy',
        password: 'Kadea_2026!',
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
        password: 'Vodacom_2026!',
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
        password: 'Valdes_2026!',
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

    // 2. RÉSEAU (FOLLOWS)
    await valdes.related('following').create({ followingId: kadea.id })
    await valdes.related('following').create({ followingId: vodacom.id })
    await valdes.related('following').create({ followingId: admin.id })
    await kadea.related('following').create({ followingId: valdes.id })

    // 3. HASHTAGS
    const tagRdc = await Hashtag.firstOrCreate({ name: 'rdc' })
    const tagTech = await Hashtag.firstOrCreate({ name: 'tech' })
    const tagKadea = await Hashtag.firstOrCreate({ name: 'KadeaAcademy' })

    // 4. TWEETS & RÉPONSES

    // --- TWEET KADEA 1 : VISION ---
    const tweetKadeaVision = await Tweet.create({
      userId: kadea.id,
      content: `Chez Kadea Academy, notre vision est claire : propulser la jeunesse congolaise vers l'excellence numérique.\n\nNous formons les leaders tech de demain pour bâtir une économie digitale forte en RDC. Rejoignez le mouvement ! 🚀 #rdc #tech #kadeaacademy`,
    })
    await tweetKadeaVision.related('hashtags').attach([tagRdc.id, tagTech.id, tagKadea.id])

    // --- TWEET KADEA 2 : NOUVEAUTÉS 2025 (AVEC IMAGE) ---
    const tweetKadeaNews = await Tweet.create({
      userId: kadea.id,
      content: `NOUVEAUTÉS 2025 : Kadea Academy enrichit son offre de formations ! 🎓\n\n✅ 95% de nos apprenants trouvent un emploi.\n✅ Financements disponibles pour tous les budgets.\n\nInscris-toi maintenant : https://bit.ly/_kadeaacademy #tech #RDC`,
      mediaUrl: 'kadea_pub.jpg',
    })
    await tweetKadeaNews.related('hashtags').attach([tagTech.id, tagRdc.id])

    // Tweet de Valdes avec MÉDIA
    const tweetValdes = await Tweet.create({
      userId: valdes.id,
      content: 'Cohorte 2025 Dévéloppement Web ! Merci @Kadeaacademy pour la formation. #rdc #tech',
      mediaUrl: 'valdesombilingo_cohorte.jpg',
    })
    await tweetValdes.related('hashtags').attach([tagRdc.id, tagTech.id])

    // Tweet de Vodacom avec MÉDIA
    const tweetVodacom = await Tweet.create({
      userId: vodacom.id,
      content: `1 Go à seulement 1 $ ! 🤩\nRestez connectés pour découvrir nos prochaines offres internet. #rdc 🌐`,
      mediaUrl: 'vodacom_pub.mp4',
    })

    // 5. LIKES & INTERACTIONS
    // Valdes et Admin likent les nouveautés de Kadea
    await tweetKadeaNews.related('likes').create({ userId: valdes.id })
    await tweetKadeaNews.related('likes').create({ userId: admin.id })

    // Vodacom like la vision de Kadea
    await tweetKadeaVision.related('likes').create({ userId: vodacom.id })

    // Kadea et Vodacom likent le tweet de Valdes
    await tweetValdes.related('likes').create({ userId: kadea.id })
    await tweetValdes.related('likes').create({ userId: vodacom.id })

    // Valdes like le tweet de Vodacom
    await tweetVodacom.related('likes').create({ userId: valdes.id })

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

    // Réponse de Valdes au tweet des nouveautés Kadea
    await Tweet.create({
      userId: valdes.id,
      parentId: tweetKadeaNews.id,
      content: 'Je recommande vivement ! Cette formation a changé ma vie. 🔥',
    })
  }
}
