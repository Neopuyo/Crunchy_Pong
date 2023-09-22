# Liste des *Endpoints*
<br>

- [01 - api/matchmaking/start](#api-matchmaking-start)
- [02 - api/matchmaking/stop](#api-matchmaking-stop)
- [03 - api/matchmaking/update](#api-matchmaking-update)


<br>

## Game Endpoint details
<br>

### `POST api/matchmaking/start` : démare la recherche de partie aleatoire <a id="api-matchmaking-start"></a>
<br>

> Requête

  ```
  headers :
  {
      "Authorization": Bearer $token
  }
  ```

  body :
  ```
  {
      "game_type" : "classic"
  }
  ```

> Reponse

  ```
  statusCode : 401
  {
      "success": "False",
      "message": "Unautorize",
  }

  statusCode : 200
  {
      "success": "False",
      "message": "You are already in game",
                 "You are already in matchmaking"
  }

  statusCode : 200
  {
      "success": "True",
      "message": "You are now in matchmaking"
  }
  ```
<br><br>

### `POST api/matchmaking/stop` : stop la recherche de partie aleatoire <a id="api-matchmaking-stop"></a>
<br>

> Requête

  ```
  headers :
  {
      "Authorization": Bearer $token
  }
  ```

> Reponse

  ```
  statusCode : 401
  {
      "success": "False",
      "message": "Unautorize",
  }

  statusCode : 200
  {
      "success": "False",
      "message": "You are not in matchmaking",
  }

  statusCode : 200
  {
      "success": "True",
      "message": "You are not in matchmaking anymore"
  }
  ```
<br><br>

### `POST api/matchmaking/update` : check si on a trouvé un oposant <a id="api-matchmaking-update"></a>
<br>

> Requête

  ```
  headers :
  {
      "Authorization": Bearer $token
  }
  ```

> Reponse

  ```
  statusCode : 401
  {
      "success": "False",
      "message": "Unautorize",
  }

  statusCode : 200
  {
      "success": "False",
      "message": "You are not in matchmaking",
  }

  statusCode : 200
  {
      "success": "True",
      "message": "Waiting for opponent"
  }

  statusCode : 200
  {
      "success": "True",
      "message": "Game found"
      "data": {
            "game_id" : "2zfe4f689ze6f4f6z4f468z5ef1z6e84"
      }
  }
  ```
<br><br>



