# 🚀 X Clone - Projet Chef-d'œuvre Kadea Academy

![Status](https://img.shields.io/badge/Status-Work--In--Progress-orange)
![Framework](https://img.shields.io/badge/Framework-AdonisJS%206-blueviolet)
![Education](https://img.shields.io/badge/Kadea%20Academy-Project-blue)

## 🎓 Contexte du Projet

Ce projet constitue le **Chef-d'œuvre** de ma formation en Développement Web à la **Kadea Academy**. Il démontre ma capacité à concevoir et déployer une application Fullstack complète en suivant les standards de l'industrie :

- **Architecture MVC** rigoureuse avec AdonisJS 6.
- **Modélisation de données** avec PostgreSQL.

---

## 📚 Documentation

Pour garantir la maintenabilité, une documentation de conception complète est disponible :

- 📊 **MCD :** : [Voir le diagramme ](https://drive.google.com/file/d/1T_Xpv9XNV9rAtdQSA3nuFH1fMNNSyJ3n/view?usp=sharing)
- 📐 **MLD :** : [Voir le diagramme ](https://dbdiagram.io/d/CLONE-X-ADONIS-JS-DB-69176d1c6735e11170e2cec4)
- 📝 **Dictionnaire de données :** : [Voir le Google docs ](https://docs.google.com/document/d/1mdbbn1kbhTOFa9G-Xxx8v8Baj0ZIG-Y-9312uSPT7Tg/edit?usp=sharing)

### 🔗 Autres liens utiles

- 🐙 **Dépôt GitHub public contenant le code source** : [https://github.com/valdesombilingo/clone_x_adonis.git](https://github.com/valdesombilingo/clone_x_adonis.git)
- 🧩 **Maquette Figma** : [Voir sur Figma](https://www.figma.com/design/cru6UhsFTEqqTvZFzzwyWT/X-clone--Copy-?node-id=0-1&p=f)

---

## 🛠 Écosystème & Bibliothèques

- **AdonisJS 6** – Framework Node.js, implémentation de l'architecture **MVC** et typage **TypeScript**.
- **Unpoly** – Framework d'amélioration progressive permettant une navigation **SPA (Single Page Application)** fluide avec rendu côté serveur.
- **Tailwind CSS** – Framework utilitaire pour un **design responsive** (Mobile-First), gestion des animations et des variables système.
- **Linkify** – Moteur de parsing pour la transformation dynamique du texte brut en **liens interactifs** (URLs, Hashtags, Mentions).
- **Cropper.js** – Bibliothèque de manipulation d'images pour le **recadrage interactif** (zoom, rotation) des avatars et bannières.
- **Emoji Picker** – Interface graphique moderne pour la sélection et l'insertion intuitive d'émojis dans les publications.

---

## ✨ Fonctionnalités Implémentées

### 🛡️ Authentification & Sécurité

- **Multi-Auth :** Inscription par email ou connexion rapide via **Google** et **GitHub** (OAuth).
- **Vérification de compte :** Validation par email obligatoire pour activer l'accès aux fonctionnalités.
- **Récupération de compte :** Processus sécurisé de réinitialisation du mot de passe via token.
- **Protection des données :** Gestion des sessions et sécurisation via middlewares dédiés.

### 👤 Gestion du Profil & Social

- **Personnalisation :** Modification de la bio, de l'avatar, de la bannière et des informations personnelles.
- **Confidentialité :** Option pour rendre son **compte privé** ou **bloquer** des utilisateurs.
- **Espace Utilisateur :** Consultation des profils avec statistiques dynamiques (abonnés/abonnements).

### 📝 Gestion des Tweets

- **Publication Multimédia :** Création de tweets (texte et/ou médias).
- **Timeline Dynamique :** Flux d'actualité personnalisé des comptes suivis.
- **Threading :** Système de réponses hiérarchisées pour engager la conversation.
- **Interactions :** Like, Unlike et contrôle total de suppression pour l'auteur.

### 🔍 Recherche & Notifications

- **Moteur Global :** Recherche de comptes (via @username) et de publications (via hashtags).
- **Système d'Alertes :** Historique complet des interactions (nouveaux abonnés, mentions @username, likes et réponses).

---

## 📂 Arborescence générale du Projet

```text
├── app/                # Cœur de l'application (Models, Controllers, Validators)
├── bin/                #Points d'entrée système (console.ts, server.ts, test.ts)
├── config/             # Configuration globale (Base de données, Auth, etc.)
├── database/           # Persistance des données (Migrations et Seeders)
├── node_modules/       # Configuration globale (Base de données, Auth, etc.)
├── public/             # Fichiers statiques (Images de profil, bannières)
├── resources/          # Vues et assets frontend (Edge Engine)
├── start/              # Fichiers de démarrage (Routes, Événements)
└── autres fichiers...
```

---

## ⚙️ Installation & Lancement du projet

- 1. Cloner le dépôt

git clone https://github.com/valdesombilingo/clone_x_adonis.git
cd clone-x

- 2. Installer les dépendances

`npm install`

- 3. Configurer l'environnement

`cp .env.example .env`

Modifiez le `.env` avec vos accès PostgreSQL

- 4. Lancer les migrations et les données de test

`node ace migration:run`
`node ace db:seed`

- 5. Lancer le serveur de développement

`node ace serve --watch`

### 🚩 Identifiants de Test (Seeders)

Pour tester la robustesse du système (comptes privés, blocages, interactions complexes), vous pouvez utiliser les profils pré-générés suivants :

| Utilisateur          | Email                | Password      | Particularité / Scénario de Test                    |
| :------------------- | :------------------- | :------------ | :-------------------------------------------------- |
| **Admin Test**       | `admin@gmail.com`    | `Admin_2026!` | **Compte Principal** (Bloqué par @darkelon)         |
| **Valdes Ombilingo** | `valdes@gmail.com`   | `Admin_2026!` | **Accès total** (Abonné accepté aux comptes privés) |
| **Dark Elon**        | `darkelon@gmail.com` | `Admin_2026!` | **Compte Privé** & Bloqueur de l'Admin              |
| **Kadea Academy**    | `kadea@gmail.com`    | `Admin_2026!` | Compte public avec Médias & Threads                 |
| **Vodacom RDC**      | `vodacom@gmail.com`  | `Admin_2026!` | Compte public avec contenu Vidéo (MP4)              |

---

## 🖼️ Aperçu

![aperçu du site](/public/images/x_clone_preview.png)

---

## 📝 Mentions & État du Projet

> **Projet de Fin de Formation (Chef-d'œuvre)**  
> Cette application est un clone fonctionnel de **X (Twitter)** développé dans le cadre de ma formation intensive à la **Kadea Academy (Kinshasa)**. Ce projet **Fullstack** a pour objectif principal de démontrer ma maîtrise complète de l'architecture **MVC (Model-View-Controller)** via le framework **AdonisJS 6**. Il met en avant des compétences avancées en modélisation de bases de données relationnelles, en logique métier complexe et en développement d'interfaces dynamiques et performantes.

> **Contenu & Données**  
> Pour l’instant, l'application est illustrée à l'aide de **données de test (Seeders)** et de profils fictifs.

> **Statut du Déploiement**  
> Le déploiement est actuellement en cours de préparation. Le lien vers l'application fonctionnelle sera ajouté ici dès que l'infrastructure **PostgreSQL** de production sera en ligne. En attendant, le projet est pleinement fonctionnel en environnement local.

---

## 📬 Contact

- 📧 **Email** : [valdes.pro@gmail.com](mailto:valdes.pro@gmail.com)
- 💼 **LinkedIn** : [valdes-ombilingo](https://www.linkedin.com/in/valdes-ombilingo-b94a72359/)
- 💻 **GitHub** : [valdesombilingo](https://github.com/valdesombilingo)

---

Merci pour votre visite ! 🙏🏼  
_#kadeaacademy #adonisJS6 #PostgreSQL #fullstack #rdc #kinshasa #devweb #xclone_
