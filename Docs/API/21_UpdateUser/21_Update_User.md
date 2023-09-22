# API Update User

**[Retour Sommaire API](../00_Sommaire_API.md)**

# Conception

# Liste des EndPoints

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

# Liste des *Endpoints*
<br>

- [00 - api/user PUT](#api-edit-users)

<br>

## Avatar Endpoint details
<br>

### `PUT api/user` : update le profil de l'user <a id="api-edit-user"></a>
<br>
<p> Pour update 1 ou plusieurs propriete par requette</p>

> Requête

  ```
  headers :
  {
      "Authorization": Bearer $token
  }
  Body :
  {
	"properties" {
		"login": string
    	"motto": string,
    	"story": string,

	}
  }
  ```

> Reponse

  ```
  statusCode : 200
  {
      "success": true,
      "message": "Properties [properties] successfully updated"
  }

  statusCode : 400
  {
    "success": false,
    "message": "...",
  }
  ```
> Dto

```
export class EditUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^(?!.*(?:'|\"|`))[!-~À-ÿ]+/)
  @Length(4, 12)
  login?: string;

  @IsString()
  @IsOptional()
  @Length(0, 35)
  motto?: string;

  @IsString()
  @IsOptional()
  @Length(0, 350)
  story?: string;
}
```

> Note
<p>update login is not implemented yet and will produce a success:false response</p>
<br><br>