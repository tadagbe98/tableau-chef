# Feuille de Route : Migration de TableauChef Web vers une Application de Bureau Locale

Ce document décrit les étapes nécessaires pour transformer l'application web TableauChef (basée sur Next.js et Firebase) en une application de bureau multiplateforme (Windows, macOS, Linux) fonctionnant localement et sans connexion internet.

---

### Phase 1 : Créer la "Coquille" de Bureau avec Electron

L'objectif de cette phase est d'encapsuler l'application web existante dans un conteneur de bureau natif. Electron est la technologie de choix car elle permet de réutiliser le code web existant.

1.  **Initialiser Electron** :
    *   Ajoutez `electron` et `electron-builder` comme dépendances de développement.
    *   Créez un fichier de point d'entrée pour Electron (ex: `main.js`) qui sera responsable de la création de la fenêtre de l'application (`BrowserWindow`).

2.  **Servir l'application Next.js** :
    *   Configurez le script de `build` dans `package.json` pour utiliser `next export`. Cela générera une version HTML/CSS/JS statique de l'application dans le dossier `out/`.
    *   Dans le fichier principal d'Electron, configurez la fenêtre pour charger le fichier `index.html` de la version exportée.

3.  **Adapter l'Interface pour le Bureau** :
    *   Utilisez le module `Menu` d'Electron pour créer des menus de bureau natifs (ex: "Fichier > Quitter").
    *   Gérez les événements du cycle de vie de la fenêtre pour une expérience utilisateur fluide.

**Résultat de la Phase 1 :** Une application de bureau qui s'installe et se lance, affichant l'interface de TableauChef. À ce stade, l'application ne sera pas fonctionnelle car elle dépend toujours des services en ligne de Firebase.

---

### Phase 2 : Remplacer la Base de Données Cloud par une Base de Données Locale

C'est l'étape la plus critique. Elle consiste à remplacer complètement Firebase par une solution de stockage locale.

1.  **Choisir une Base de Données Locale** :
    *   La technologie recommandée est **SQLite**. Elle est sans serveur, légère et stocke toute la base de données dans un seul fichier, ce qui est parfait pour une application de bureau.
    *   Ajoutez un pilote SQLite pour Node.js (ex: `sqlite3`).

2.  **Adopter un ORM pour la Gestion des Données** :
    *   Utilisez un ORM (Object-Relational Mapper) comme **Prisma** ou **Sequelize**. Cela simplifiera les interactions avec la base de données et rendra le code plus maintenable.
    *   Définissez le schéma de la base de données (tables pour `products`, `inventory`, `orders`, `users`, etc.) en utilisant la syntaxe de l'ORM. Ce schéma doit refléter la structure des collections Firestore.

3.  **Migrer la Logique d'Accès aux Données** :
    *   Parcourez l'ensemble du projet (composants React, contextes, etc.).
    *   Remplacez systématiquement tous les appels à l'API Firestore (`getDoc`, `addDoc`, `onSnapshot`, `query`, `where`, etc.).
    *   Utilisez les méthodes fournies par l'ORM pour effectuer les opérations CRUD (Create, Read, Update, Delete) sur la base de données SQLite locale (ex: `prisma.product.findMany()`, `prisma.order.create()`).
    *   La réactivité temps réel de `onSnapshot` devra être simulée en rechargeant les données ou en utilisant un système d'événements interne à l'application après chaque modification.

**Résultat de la Phase 2 :** L'application est maintenant capable de lire et d'écrire toutes ses données de manière autonome sur l'ordinateur de l'utilisateur, sans aucune connexion internet.

---

### Phase 3 : Remplacer le Système d'Authentification Firebase

L'authentification doit également devenir locale, car Firebase Auth ne sera plus accessible.

1.  **Adapter le Schéma Utilisateur** :
    *   Assurez-vous que la table `users` dans la base de données SQLite possède un champ pour stocker le mot de passe de manière sécurisée.

2.  **Sécuriser les Mots de Passe** :
    *   Intégrez une bibliothèque de hachage de mots de passe comme **bcrypt**.
    *   Lors de la création d'un utilisateur ou de la modification d'un mot de passe, utilisez `bcrypt` pour hacher le mot de passe avant de le stocker dans la base de données. **Ne jamais stocker de mots de passe en clair.**

3.  **Réécrire la Logique d'Authentification** :
    *   Modifiez les formulaires de connexion et d'inscription pour qu'ils interagissent avec la base de données locale via l'ORM.
    *   Lors d'une tentative de connexion, récupérez l'utilisateur par son email, puis utilisez `bcrypt.compare()` pour vérifier si le mot de passe fourni correspond au hash stocké.
    *   Mettez à jour le `AuthContext` pour gérer l'état de l'utilisateur connecté localement.

**Résultat de la Phase 3 :** Le système de connexion est entièrement fonctionnel hors ligne.

---

### Phase 4 : Peaufinage, Empaquetage et Distribution

Cette dernière phase consiste à transformer le projet en un produit distribuable et professionnel.

1.  **Personnalisation de l'Application** :
    *   Définissez une icône d'application (`.ico` pour Windows, `.icns` pour macOS) pour une reconnaissance visuelle sur le bureau.

2.  **Empaqueter l'Application** :
    *   Utilisez un outil comme **Electron Builder**. Il prendra votre code Electron et le compilera en installateurs natifs pour les différentes plateformes :
        *   Un fichier `.exe` pour Windows.
        *   Un fichier `.dmg` pour macOS.
        *   Un fichier `.AppImage` ou `.deb` pour Linux.

3.  **(Optionnel) Mises à Jour Automatiques** :
    *   Intégrez le module `electron-updater`.
    *   Configurez-le pour qu'il vérifie périodiquement si une nouvelle version de l'application est disponible sur un serveur (ex: GitHub Releases). Si c'est le cas, il peut la télécharger et l'installer automatiquement.

**Résultat Final :** Un logiciel de bureau TableauChef complet, installable, et utilisable en toute autonomie par les restaurateurs sur leurs propres ordinateurs.
