# CRM

Site en ligne : [https://yahyacrm.vercel.app](https://yahyacrm.vercel.app)

## Lancer le projet

1. Copier `back/.env.example` vers `back/.env`.
2. Remplacer `MONGODB_URI` par l'adresse de la base MongoDB.
3. Installer les dépendances, puis lancer le serveur :

```bash
npm install
npm start
```

`npm start` exécute `node index.js`. Pour relancer le serveur à chaque modification :

```bash
npm run dev
```

`npm run dev` exécute `nodemon index.js`.

Les mêmes scripts sont disponibles dans le dossier `back`.

4. Ouvrir [http://localhost:3000](http://localhost:3000).

L'interface de gestion des clients est sur [http://localhost:3000/crm](http://localhost:3000/crm).

## Questions bonus

Les trois questions bonus sont réalisées :

- Les scripts `start` et `dev` lancent `index.js` avec Node.js et nodemon.
- Express expose `/` (`Hello from le front, Yahya Azzab`), `/login` et `/sign-up`.
- `GET /api/test` renvoie `{ "message": "Connexion Front-Back réussie" }`. La page `/crm` récupère ce message avec `fetch()` et l'affiche.
