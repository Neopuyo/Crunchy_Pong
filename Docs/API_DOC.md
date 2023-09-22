# Conception

- Authentification 
  - Register ( exemple POST )

<br><br>

- Game 
  - Get informations d'une game ( exemple GET )

<br><br>

# Liste des *Endpoints*
<br>

## Authentification

<br>

### `POST /api/register` : registration d'un utilisateur

<br>

> Requête

  ```
  headers :
  {
      "Authorization": "Bearer $token"
  }

  Body :
  {
      "username": "string",
      "password": "string"
  }
  ```

> Reponse

  ```
  Code : 400
  {
      "success": "False",
      "message": "Invalid username or password"
                 "Username or password is empty"
                 "Username already exists"
  }

  Code : 200
  {
      "success": "True",
      "message": "Registration successful"
  }
  ```
<br><br>

### `GET /api/games/:id` : récupération des informations d'une partie
<br>

> Requête

  ```
  headers :
  {
      "Authorization": "Bearer $token"
  }

  Body :
  {

  }
  ```

> Reponse

  ```
  Code : 404
  {
      "success": "False",
      "message": "Game not found"
  }

  Code : 400
  {
      "success": "False",
      "message": "You are not logged in"
  }

  Code : 200
  {
      "game": 
      {
          "shots": $all_player_shots
          "ships": $player ships
          "state": $state
          "yourturn": $turn
      }
  }
  ```
États de la partie :
- `waiting` : en attente de joueurs
- `playing` : en cours de jeu
- `finished` : partie terminée
<br><br>
