# Module Gestion Double Authentification

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée

# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

Sous module de gestion de la définition / modification d'un Login / UserName / ChannelName
- Champ texte
- Nom du champ en titre
- Bulle d'info : 
	- UserName : "visible to other user, cannot be the same as the login, can be change, must be more than 3 characters, cannot be composed of # @ &"
	- ChannelName : "visible to other user, can be change, must be more than 3 characters, cannot be composed of # @ &"

> **Action**

- Au clic en dehors ou touch Entrée cheker erreur

> **Gestion Erreur**

- minimum 3 charactères (utile pour déclanchement recherche)
	- charactères interdit : # @ &
	- checker si déjà utilisé avec [API 31 - List User/Channel](../API/31_List_User_Channel.md) (attention si login utilisé mais avec 42 OAuth alors c'est ok pour éviter blocage à l'inverse)

> **Gestion Succès**
