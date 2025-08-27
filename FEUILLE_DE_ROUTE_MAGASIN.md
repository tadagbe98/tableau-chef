# Feuille de Route : Adapter TableauChef en une Solution de Gestion pour Magasins et Ateliers

Ce document détaille les étapes nécessaires pour transformer l'application **TableauChef**, initialement conçue pour les restaurants, en une application de gestion polyvalente destinée aux quincailleries, magasins de détail, et ateliers d'artisanat.

---

### **Objectif :** Créer "GestionPro" (ou un nom de votre choix)

Une application SaaS multi-commerces, intuitive et robuste, basée sur la structure existante de TableauChef.

---

## Phase 1 : Le "Rebranding" - Identité et Nettoyage (1-2 jours)

L'objectif est de retirer toute référence à la restauration pour créer une base neutre et professionnelle.

1.  **Changement de Nom et Logo :**
    *   **Action :** Parcourez tout le projet et remplacez "TableauChef" par votre nouveau nom (ex: "GestionPro").
    *   **Fichiers clés à modifier :** `package.json`, `src/app/layout.tsx` (titre), `src/app/page.tsx`, `src/app/login/page.tsx`, etc.
    *   **Action :** Créez un nouveau logo générique et mettez à jour le composant `src/components/icons/logo.tsx`.

2.  **Adapter la Sémantique (le vocabulaire) :**
    *   **Action :** Remplacez les termes spécifiques à la restauration par des termes génériques.
        *   `Restaurant` -> `Magasin` / `Entreprise` / `Organisation`
        *   `Table` (dans les commandes) -> `Client` / `Référence Commande`
        *   `Recette` -> `Nomenclature` / `Kit de fabrication`
        *   `Plat` / `Menu` -> `Produit` / `Article` / `Service`
    *   **Fichiers concernés :** Tous les fichiers dans `src/app/dashboard/`, les pages d'authentification, etc.

3.  **Nettoyage des Fonctionnalités Spécifiques :**
    *   **Action :** Supprimez ou désactivez les éléments purement culinaires.
    *   **Exemples :** Le "Plan de Salle" sur la page des commandes, les catégories de produits par défaut comme "Pizzas", "Boissons".
    *   **Fichiers clés :** `src/app/dashboard/orders/page.tsx`, `src/app/dashboard/products/page.tsx`.

**Résultat de la Phase 1 :** L'application a une nouvelle identité. L'interface utilisateur est neutre et prête à être adaptée à de nouveaux contextes commerciaux.

---

## Phase 2 : Adaptation du Cœur de l'Application (3-5 jours)

Ici, on modifie la logique métier pour qu'elle corresponde aux besoins d'un magasin ou d'un atelier.

1.  **Gestion des Produits/Services :**
    *   **Objectif :** Permettre de gérer des articles avec des attributs plus variés.
    *   **Action :** Modifiez le formulaire d'ajout de produit (`src/app/dashboard/products/page.tsx`).
        *   Ajoutez des champs comme `Référence / SKU`, `Fournisseur`, `Prix d'achat`, `Marge (calculée automatiquement)`.
        *   Le champ `Stock` doit être plus central.

2.  **Gestion de l'Inventaire :**
    *   **Objectif :** Adapter le suivi de stock à des biens matériels.
    *   **Action :** Renforcez la page `src/app/dashboard/inventory/page.tsx`.
        *   La notion de "Comptage physique" est déjà là et est parfaite.
        *   Assurez-vous que chaque vente décrémente correctement le stock du produit correspondant.

3.  **Refonte du Système de Commandes :**
    *   **Objectif :** Passer d'une logique de "commande de restaurant" à une logique de "vente" ou de "facture".
    *   **Action :** Modifiez en profondeur `src/app/dashboard/orders/page.tsx`.
        *   Remplacez la sélection de table par un champ `Nom du Client` ou `Référence Client`.
        *   Ajoutez des fonctionnalités de **devis** : une commande peut avoir un statut "Devis" avant de devenir "Facturée" ou "Payée".
        *   Adaptez la génération de reçu pour qu'elle ressemble à une **facture** (avec TVA, détails de l'entreprise, etc.).

4.  **Clients et Fournisseurs :**
    *   **Objectif :** Créer une base de données pour les tiers.
    *   **Action :** Créez une nouvelle section "Contacts" ou "Tiers".
        *   Créez une nouvelle collection `contacts` dans Firestore.
        *   Développez une interface pour ajouter/modifier des contacts (clients et fournisseurs).
        *   Liez les commandes aux clients et les produits aux fournisseurs.

**Résultat de la Phase 2 :** Le cœur de l'application est maintenant adapté à la gestion commerciale standard. On peut vendre un produit à un client et suivre son stock.

---

## Phase 3 : Fonctionnalités Avancées et Spécifiques (5-7 jours)

C'est ici que l'application gagne une vraie valeur ajoutée pour les artisans et les commerçants.

1.  **Nomenclature et Fabrication (pour les ateliers) :**
    *   **Objectif :** Permettre de définir un produit fini comme un assemblage de matières premières.
    *   **Action :** Créez une fonctionnalité de "Kits" ou "Nomenclatures".
        *   Un produit (ex: "Table en bois") peut être lié à des articles d'inventaire (ex: 4 pieds de table, 1 plateau, 8 vis).
        *   Lors de la "fabrication" d'une table, les stocks des matières premières sont décrémentés.
        *   Lors de la vente de la table, le stock du produit fini est décrémenté.

2.  **Gestion des Achats :**
    *   **Objectif :** Suivre les commandes passées aux fournisseurs.
    *   **Action :** Créez une section "Achats".
        *   Permet de créer des bons de commande pour les fournisseurs.
        *   À la réception de la commande, les niveaux de stock dans l'inventaire sont automatiquement augmentés.

3.  **Rapports Financiers Améliorés :**
    *   **Objectif :** Offrir une vision claire de la santé financière.
    *   **Action :** Améliorez la page `src/app/dashboard/reports/page.tsx`.
        *   Calculez la **marge brute** (Prix de vente - Prix d'achat).
        *   Affichez le rapport de la valeur totale du stock.
        *   Suivez le chiffre d'affaires par client.

**Résultat de la Phase 3 :** L'application n'est plus un simple TPV (Terminal Point de Vente), mais un mini-ERP (Enterprise Resource Planning) capable de gérer le cycle de vie complet d'un produit, de l'achat de la matière première à la vente du produit fini.

---

## Phase 4 : Déploiement et Itérations

1.  **Tests Approfondis :**
    *   **Action :** Testez chaque fonctionnalité avec des scénarios réels pour chaque type de commerce (quincaillerie, atelier, etc.).

2.  **Déploiement Initial (Bêta) :**
    *   **Action :** Déployez l'application et invitez quelques utilisateurs tests pour obtenir des retours.

3.  **Marketing et Lancement :**
    *   **Action :** Mettez à jour la page d'accueil (`src/app/page.tsx`) pour refléter la nouvelle offre et les nouvelles fonctionnalités.
    *   Communiquez sur votre nouvelle solution !

En suivant cette feuille de route, vous transformerez méthodiquement votre application existante en un nouvel outil puissant et polyvalent. Bonne chance !
