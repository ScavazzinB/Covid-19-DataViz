# 🚀 Guide de Déploiement Vercel

Ce guide vous explique comment déployer le dashboard COVID-19 sur Vercel avec GitHub Actions.

## Configuration Vercel

### 1. Créer un Projet Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Importez le repository `Covid-19-DataViz`
4. Vercel détectera automatiquement qu'il s'agit d'un projet React
5. Configurez les variables d'environnement (voir ci-dessous)

### 2. Variables d'Environnement Vercel

Dans les paramètres du projet Vercel, ajoutez ces variables :

```env
REACT_APP_API_BASE_URL=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series
REACT_APP_COVID_API_URL=https://disease.sh/v3/covid-19
```

### 3. Récupérer les Identifiants Vercel

Pour l'intégration GitHub Actions, vous aurez besoin de :

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Dans le dossier du projet
vercel link

# Récupérer les IDs (ils seront dans .vercel/project.json)
cat .vercel/project.json
```

## Configuration GitHub Secrets

Dans les paramètres GitHub du repository (`Settings` → `Secrets and variables` → `Actions`), ajoutez :

### Secrets Requis

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `VERCEL_TOKEN` | Token d'accès Vercel | [Dashboard Vercel](https://vercel.com/account/tokens) → Generate New Token |
| `VERCEL_ORG_ID` | ID de votre organisation | Dans `.vercel/project.json` après `vercel link` |
| `VERCEL_PROJECT_ID` | ID du projet | Dans `.vercel/project.json` après `vercel link` |

### Variables d'Environnement (optionnelles)

| Variable | Valeur |
|----------|--------|
| `REACT_APP_API_BASE_URL` | `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series` |
| `REACT_APP_COVID_API_URL` | `https://disease.sh/v3/covid-19` |

## Pipeline de Déploiement

Le pipeline GitHub Actions comprend :

### 🧪 Tests & Qualité
- **TypeScript Check** : Vérification des types
- **ESLint** : Analyse du code
- **Tests unitaires** : Avec coverage
- **Build** : Construction de l'application

### 🔒 Sécurité
- **Audit de sécurité** : Scan des vulnérabilités
- **Vérification des dépendances** : avec audit-ci

### 🚀 Déploiement
- **Production** : Déploiement automatique sur `master`
- **Preview** : URL de prévisualisation pour les PR
- **Comments automatiques** : URLs de déploiement dans les PR

## Structure des URLs

```
Production:  https://covid-19-dataviz.vercel.app
Preview:     https://covid-19-dataviz-[hash].vercel.app
```

## Monitoring et Logs

### Vercel Dashboard
- Analytics : Trafic et performance
- Functions : Logs des API
- Deployments : Historique des déploiements

### GitHub Actions
- Workflow runs : Historique des builds
- Artifacts : Fichiers de build
- Coverage reports : Couverture de code

## Troubleshooting

### Erreurs Communes

1. **Build Failed - TypeScript Error**
   ```bash
   npm run typecheck  # Vérifier localement
   ```

2. **Vercel Token Invalid**
   - Regénérer le token sur [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Mettre à jour le secret GitHub

3. **API CORS Error**
   - Vérifier les CSP dans `vercel.json`
   - Ajouter les domaines dans les headers

4. **Environment Variables Missing**
   - Vérifier dans Vercel Dashboard → Project → Settings → Environment Variables
   - Redéployer après ajout des variables

### Commandes Utiles

```bash
# Test local
npm start

# Build production
npm run build

# Déploiement manuel Vercel
vercel --prod

# Preview deployment
vercel

# Logs Vercel
vercel logs
```

## 🏆 Fonctionnalités Déployées

- ✅ Dashboard COVID-19 interactif
- ✅ Carte mondiale Leaflet avec données temps réel
- ✅ Thème sombre/clair responsive
- ✅ PWA (Progressive Web App) ready
- ✅ Analytics et monitoring intégrés
- ✅ CDN global avec Vercel Edge Network
- ✅ Auto-scaling et haute disponibilité

---

**🚀 Votre dashboard est maintenant prêt pour la production !**