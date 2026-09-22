# PDCA — Gestion industrielle

Application mobile (Android / iOS) et web de gestion PDCA (Plan-Do-Check-Act) pour environnement industriel.

## Stack

- React Native via Expo SDK 52
- TypeScript strict
- Expo Router (file-based routing, drawer navigation)
- Supabase (PostgreSQL + Auth + RLS)
- Cibles : Android, iOS, Web

## Fonctionnalités

- Authentification Supabase (login / logout / session persistée)
- Création de PDCA avec plusieurs actions
- Suivi de progression P / D / C / A (25 / 50 / 75 / 100 %)
- Priorités (Faible / Moyenne / Élevée) avec indicateurs visuels
- Filtres par département, pilote, priorité, statut
- Tableau de bord (total, ouverts, en cours, terminés, en retard)
- Pages par département (12 départements)
- Vue Pilotes (charge par responsable)
- Historique complet (audit trail)
- Actions annulées (soft delete)
- Graphiques (7 charts)
- Rapport hebdomadaire (semaine en cours / passée)
- Lessons Learned (retours d expérience)
- Tour Usine (visites terrain)

## Prérequis

- Node.js 18+
- npm 9+
- Un projet Supabase

## Installation

1. Installer les dépendances :

       npm install --legacy-peer-deps

2. Créer le fichier d environnement :

       cp .env.example .env

   Puis renseigner :

       EXPO_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
       EXPO_PUBLIC_SUPABASE_ANON_KEY=...   (anon / publishable — JAMAIS service_role)

## Base de données

Dans Supabase > SQL Editor :

1. Exécuter le contenu de supabase/migrations/001_initial.sql (schéma, RLS, triggers).
2. Créer un user dans Authentication > Users (Auto-Confirm ON).
3. Optionnel : exécuter le seed de démonstration fourni séparément.

## Développement

       npm run web        # web (localhost:8081)
       npm run start      # Expo dev server (QR code pour mobile)
       npm run android    # émulateur ou device Android
       npm run ios        # simulateur iOS (macOS uniquement)
       npm run typecheck  # TypeScript

Sur Codespaces / environnement sans accès réseau sortant :

       EXPO_NO_TELEMETRY=1 npx expo start --web --clear --offline

## Structure

    app/                    Expo Router (routes)
      (auth)/               Login
      (app)/                Zone protégée
        dashboard.tsx
        pdca/               Liste, création, détail
        department/[dept]   Page département (12 au total)
        pilotes.tsx
        historique.tsx
        graphiques.tsx
        rapport-hebdo.tsx
        lessons-learned.tsx
        tour-usine.tsx
        actions-annulees.tsx
    src/
      components/           Button, Input, Select, DateField, Card, Badges,
                            PDCAProgressBar, ActionCard, Charts, Skeleton,
                            ErrorBoundary, FilterBar, States
      hooks/                useAuth
      lib/                  supabase client
      services/             pdcaService, analyticsService, lessonsService, tourService
      constants/            LINES, PILOTS, DEFECT_TYPES, DEPARTMENTS, PRIORITIES
      theme/                colors, spacing, radius
      types/                database.ts (Row types)
      ui/                   UIProvider (Confirm + Toast)
    supabase/migrations/    SQL

## Sécurité

- RLS activé sur toutes les tables.
- Le client mobile n utilise que la clé anon / publishable.
- Ne JAMAIS committer .env ni la clé service_role.
- Si une clé fuite : Supabase > Project Settings > API > JWT Settings > Generate new JWT secret.

## Licence

Propriétaire — usage interne.
