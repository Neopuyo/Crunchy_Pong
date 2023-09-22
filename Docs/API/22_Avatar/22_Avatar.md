# Liste des *Endpoints*
<br>

- [00 - api/avatar PUT](#api-avatar-edit-colors)

<br>

## Avatar Endpoint details
<br>

### `PUT api/avatar` : update les couleurs de l'avatar de l'user <a id="api-avatar-edit-colors"></a>
<br>
<p> l'update des couleurs d'un avatar de channel devra avoir son propre api</p>

> Requête

  ```
  headers :
  {
      "Authorization": Bearer $token
  }
  Body :
  {
    "borderColor": "#FF",
    "backgroundColor": "#FFFFff",
  }
  ```

> Reponse

  ```
  statusCode : 200
  {
      "success": true,
      "message": "Avatar colors successfully updated"
  }

  statusCode : 400
  {
    "success": false,
    "message": "borderColor must be a hexadecimal color"
               "borderColor must be one of the following values: #f44336, #e91e63, #9c27b0, #673ab7, #3f51b5, #2196f3, #03a9f4, #00bcd4, #009688, #4caf50, #8bc34a, #cddc39, #ffeb3b, #ffc107, #ff9800, #ff5722, #795548, #607d8b",
  }
  ```
<br><br>