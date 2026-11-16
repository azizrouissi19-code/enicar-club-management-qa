# Tests d'API dans Postman

Collection : `ENICarthage-Clubs-API.postman_collection.json` — 8 dossiers, 39 requêtes, 55 vérifications
(cas de test TI-01 à TI-07). Elle est générée par `node qa/postman/build-collection.mjs`.

## Exécuter la collection dans Postman

1. Démarrer la base de données et le backend (http://localhost:9090).
2. Postman → **Import** → choisir `ENICarthage-Clubs-API.postman_collection.json`.
3. Dans la barre latérale, cliquer sur les **…** de la collection → **Run collection**.
4. Garder l'ordre des requêtes (les jetons et l'identifiant de la salle sont passés d'une requête à la suivante) → **Run ENICarthage Clubs…**.
5. Le Collection Runner affiche chaque requête et chaque vérification en vert (réussie) ou rouge (échouée).

Captures à prendre pour le rapport : la collection ouverte (dossiers TI-01 à TI-07), une requête avec son onglet
**Scripts → Post-response** (les `pm.test`), le résultat de cette requête (onglet **Test Results**), et le récapitulatif
du Collection Runner.

## En ligne de commande (même collection)

```
npx newman run qa/postman/ENICarthage-Clubs-API.postman_collection.json
```
