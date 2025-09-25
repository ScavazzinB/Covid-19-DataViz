# COVID-19 Dashboard

Dashboard en temps réel pour suivre les données COVID-19 dans le monde, basé sur les données de Johns Hopkins University.

## 📊 Fonctionnalités

- ✅ Statistiques globales en temps réel
- 📈 Graphiques d'évolution temporelle
- 🌍 Liste des pays avec détails
- 🔍 Recherche de pays
- 📱 Interface responsive
- ⚡ Indicateurs de chargement
- 🚨 Gestion d'erreurs robuste

## 🛠️ Stack Technique

- **Frontend**: React 19 + TypeScript
- **Graphiques**: Chart.js + react-chartjs-2
- **Données**: API Johns Hopkins University
- **Parsing CSV**: PapaParse
- **Styling**: CSS3 + Design responsive
- **Tests**: Jest + Testing Library
- **Qualité de code**: ESLint + Prettier
- **Déploiement**: Vercel

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd covid-dashboard

# Installer les dépendances
npm install

# Lancer en développement
npm start
```

L'application sera disponible à `http://localhost:3000`

## 📜 Scripts Disponibles

```bash
# Développement
npm start              # Démarrer le serveur de développement
npm run build          # Build de production
npm test               # Lancer les tests
npm run test:coverage  # Tests avec couverture

# Qualité de code
npm run lint           # Vérifier ESLint
npm run lint:fix       # Corriger automatiquement les erreurs ESLint
npm run format         # Formater avec Prettier
npm run typecheck      # Vérifier les types TypeScript
```

## 📁 Structure du Projet

```
src/
├── components/           # Composants React réutilisables
│   ├── GlobalStats.tsx   # Cartes de statistiques
│   ├── TrendsChart.tsx   # Graphiques d'évolution
│   ├── CountryComparison.tsx # Liste et comparaison des pays
│   ├── Header.tsx        # En-tête de l'application
│   └── WorldMap.tsx      # Carte du monde (future implémentation)
├── services/            # Services et API
│   └── api.ts           # Service pour récupérer les données Johns Hopkins
├── types/               # Interfaces TypeScript
├── utils/               # Utilitaires et helpers
├── hooks/               # Hooks React personnalisés
├── App.tsx              # Composant principal
└── index.tsx            # Point d'entrée
```

## 🌐 Sources de Données

Les données proviennent du [repository COVID-19 de Johns Hopkins](https://github.com/CSSEGISandData/COVID-19):

- **Cas confirmés**: https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv
- **Décès**: https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv
- **Guérisons**: https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Générer le rapport de couverture
npm run test:coverage
```

## 📱 Responsive Design

L'application est optimisée pour :
- 🖥️ Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (320px - 767px)

## 🔧 Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
REACT_APP_API_BASE_URL=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Les variables d'environnement seront configurées automatiquement
3. Le déploiement se fait à chaque push sur `main`

### Autres plateformes

```bash
npm run build
# Déployer le contenu du dossier `build/`
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème, ouvrir une [issue](https://github.com/votre-username/covid-dashboard/issues) sur GitHub.