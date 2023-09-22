# API 42 OAuth

**[Retour Sommaire API](./00_Sommaire_API.md)**

# Conception
Tout est explique dans la documentation : https://api.intra.42.fr/apidoc/guides/web_application_flow

Une api a été créée sur le profil bperriol.
Pour connecter le client, un bouton "log in with 42" est présent et charge une page de connexion 42 lorsque le client clique dessus.
Apres s'etre connecté, 42 redirige l'utilisateur sur le lien http://localhost:3000/home avec un code donné dans l'url.

Ce code est envoyé avec une POST request faite dans le module "auth" dans le backend, en joignant les identifiants correspondant à l'app créée sur l'intra de 42.

Ceci retourne un token d'accès qui permet de faire des requêtes à l'api de 42.

# Requêtes utiles pour la connection avec l'api de 42

- Requête du front au backend qui retourne les informations de l'utilisateur connecté à 42
GET "http://backend:4000//api/auth/42/:code"

- Requête du backend à l'api de 42 qui retourne un token d'accès
POST "https://api.intra.42.fr/oauth/token"
Les paramètres possibles sont données dans le lien de la doc en haut de page.

- requête du backend à l'api de 42 qui retourne les informations du profil de l'utilisateur (retournéees alors au front)
GET "https://api.intra.42.fr/v2/me"
Paramètre : token d'accès.

# Liste des *Endpoints*
<br>

- [01 - api/auth/42/:code](#api-auth-42)

<br>

## Game Endpoint details
<br>

### `GET api/auth/42/:code` : connection avec api 42 <a id="api-auth-42"></a>
<br>

> Requête

  ```
  headers :

  ```

> Reponse

  ```

  statusCode : 200
  {
      "acces_token": $token,
  }

  ```
<br><br>
