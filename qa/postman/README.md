# Tests d'API dans Postman — fonctionnels et non fonctionnels

Collection : `ENICarthage-Clubs-API.postman_collection.json` — 53 requêtes, 86 vérifications.
Elle est générée par `node qa/postman/build-collection.mjs`.

| Dossier | Contenu |
|---|---|
| 00 — Préparation des données | Connexions (admin, président) et compte membre ; à exécuter en premier |
| **A — Tests fonctionnels** | TI-01 Connexion, TI-02 Inscription, TI-07 Salles, TI-04 Clubs, TI-05 Événements, TI-06 Réservations |
| **B — Tests non fonctionnels** | NF-01 Performance (temps de réponse), NF-02 Sécurité (accès, injection SQL, CORS, mot de passe), NF-03 Robustesse (entrées invalides, jamais de 500) |

## Exécuter dans Postman

1. Démarrer la base de données et le backend (http://localhost:9090).
2. Postman → **Import** → choisir `ENICarthage-Clubs-API.postman_collection.json`.
3. **Toute la collection :** **…** de la collection → **Run collection** → garder l'ordre → **Run**.
   Chaque requête et chaque vérification s'affiche en vert (réussie) ou rouge (échouée).
4. **Test de charge (non fonctionnel) :** dans le Collection Runner, onglet **Performance**, choisir le dossier
   **NF-01 — Performance**, par exemple 20 utilisateurs virtuels pendant 1 minute → **Run**. Postman trace le temps
   de réponse moyen et le taux d'erreur.

## Captures pour le rapport

1. La collection ouverte : dossiers A (fonctionnels) et B (non fonctionnels).
2. Le Collection Runner après exécution : toutes les vérifications en vert.
3. Une requête du dossier B (par exemple « CORS : site non autorisé → refusé ») avec l'onglet **Test Results**.
4. Le résultat de l'onglet **Performance** (courbe du temps de réponse).

## En ligne de commande (même collection)

```
npx newman run qa/postman/ENICarthage-Clubs-API.postman_collection.json
```
