# API Création de Compte

**[Retour Sommaire API](./00_Sommaire_API.md)**

# Conception

# Liste des EndPoints

<br>

- [01 - api/users/login?login=${login}](#api-users-login)
- [01 - api/users/email?email=${email}](#api-users-email)
- [02 - api/auth/register](#api-auth-register)

<br>

## Endpoint details
<br>

### `GET api/users/login?login=${login}` : check if login already exists <a id="api-users-login"></a>
<br>

> Requête

  ```
  headers :

  ```
  body :

  ```

> Reponse

  ```
  statusCode : 200
  {
    exists: true,
  }

  {
    exists: false,
  }

  ```
<br><br>

### `GET api/users/email?email=${email}` : check if email already exists <a id="api-users-email"></a>
<br>

> Requête

  ```
  headers :

  ```
  body :

  ```

> Reponse

  ```
  statusCode : 200
  {
    exists: true,
  }

  {
    exists: false,
  }

  ```
<br><br>

### `POST api/auth/register` : inscription par email, login, mot de passe <a id="api-auth-register"></a>
<br>

> Requête

  ```
  headers : {
    "Content-Type": "application/json"
  }

  ```
  body : {
    "email": $email,
    "login": $login,
    "password": $password
  }

  ```

> Reponse

  ```

  statusCode : 200,

  ```
<br><br>
