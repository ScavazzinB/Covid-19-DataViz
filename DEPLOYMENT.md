# 🚀 Guide de Déploiement - COVID-19 Dashboard

Ce guide explique comment déployer l'application COVID-19 Dashboard sur Vercel avec GitHub Actions pour la CI/CD.

## 📋 Prérequis

- Compte GitHub
- Compte Vercel
- Repository GitHub avec le code du projet
- Node.js 18+ installé localement pour les tests

## ⚙️ Configuration Vercel

### 1. Créer un projet Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Vercel détectera automatiquement qu'il s'agit d'un projet React

### 2. Configuration des variables d'environnement

Dans les paramètres Vercel de votre projet :

**Variables d'environnement :**
```bash
REACT_APP_API_BASE_URL=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series
```

### 3. Configuration du Build

Vercel détecte automatiquement :
- **Framework**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

## 🔧 Configuration GitHub Actions

### 1. Secrets GitHub

Dans votre repository GitHub, allez dans **Settings > Secrets and variables > Actions** et ajoutez :

#### Secrets requis :

1. **VERCEL_TOKEN**
   - Allez sur [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Créez un nouveau token avec les permissions appropriées
   - Copiez le token et ajoutez-le comme secret

2. **VERCEL_ORG_ID**
   ```bash
   # Exécutez localement après avoir installé Vercel CLI
   npx vercel link
   cat .vercel/project.json
   ```
   - Copiez la valeur de `"orgId"`

3. **VERCEL_PROJECT_ID**
   ```bash
   # Depuis le même fichier .vercel/project.json
   cat .vercel/project.json
   ```
   - Copiez la valeur de `"projectId"`

### 2. Configuration Vercel CLI (optionnel pour local)

```bash
# Installation globale
npm install -g vercel

# Connexion à votre compte
vercel login

# Lier le projet (depuis la racine du projet)
vercel link

# Déploiement manuel de test
vercel --prod
```

## 🔄 Pipeline CI/CD

### Workflow automatique :

1. **Push sur main/master** → Déploiement production
2. **Pull Request** → Déploiement preview + commentaire avec URL
3. **Tous les pushes** → Tests, linting, audit sécurité

### Jobs inclus :

- ✅ **Tests** (Jest + React Testing Library)
- 🔍 **Linting** (ESLint + Prettier)
- 🏗️ **Build** avec optimisations
- 🔒 **Audit sécurité** (npm audit)
- 🚀 **Déploiement** Vercel

## 📊 Monitoring et Analytics

### Vercel Analytics

Activez les analytics Vercel pour surveiller :
- Performances (Core Web Vitals)
- Trafic et utilisation
- Erreurs runtime

### GitHub Actions

Surveillez les builds dans l'onglet **Actions** :
- Temps de build
- Taux de succès
- Couverture de code

## 🛠️ Scripts Utiles

```bash
# Développement local
npm start

# Build de production
npm run build

# Tests avec couverture
npm run test:coverage

# Linting et formatage
npm run lint
npm run format

# Vérification TypeScript
npm run typecheck

# Servir le build localement
npm run serve

# Analyser la taille du bundle
npm run analyze
```

## 🌍 URLs du Projet

- **Production** : https://[project-name].vercel.app
- **Preview** : URLs générées automatiquement pour chaque PR
- **Repository** : https://github.com/[username]/covid-dashboard

## 🚨 Dépannage

### Erreurs communes :

1. **Build Failed**
   ```bash
   # Vérifiez localement
   npm run build
   npm run typecheck
   npm run lint
   ```

2. **Vercel Token Invalid**
   - Régénérez le token sur Vercel
   - Mettez à jour le secret GitHub

3. **Tests Failed**
   ```bash
   # Exécutez les tests localement
   npm test
   ```

4. **Env Variables Missing**
   - Vérifiez les variables dans Vercel Dashboard
   - Assurez-vous qu'elles commencent par `REACT_APP_`

### Logs utiles :

- **GitHub Actions** : Onglet Actions du repository
- **Vercel Builds** : Dashboard Vercel > Project > Functions
- **Runtime Logs** : Vercel Dashboard > Project > Functions > View Function Logs

## 🔐 Sécurité

### Headers de sécurité inclus :

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy

### CORS Configuration :

- API endpoints configurés pour les domaines autorisés
- Whitelist des sources de données (Johns Hopkins)

## 📈 Optimisations

### Build Optimizations :

- **Code Splitting** automatique (React)
- **Tree Shaking** (Webpack)
- **Minification** (Terser)
- **Compression** (Gzip/Brotli via Vercel)

### Vercel Edge Network :

- CDN global automatique
- Cache intelligent des assets
- Compression image automatique

## 🎯 Métriques de Performance

Objectifs :
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **Time to Interactive** : < 3.5s
- **Cumulative Layout Shift** : < 0.1

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **GitHub Actions Docs** : https://docs.github.com/en/actions
- **Issues** : Repository GitHub Issues