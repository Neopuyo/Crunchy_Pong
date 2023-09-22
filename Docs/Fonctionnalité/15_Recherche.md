# Module Recherche

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 31 - List User Channel](../API/31_List_User_Channel.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/Recherche_Reduit.png" />
</p>

## Etape

> **Affichage**

- Icone Recherche
- Zone de recherche puis une fois dedans menu déroulant :
	- Par défaut texte "Please enter your research (min 3 characters)"
	- 2 sections Channel / User :
		- Afficher titre de section que si un résultat pour le type
	- Sur la base des charactères dans le champ recherche (min 3 charactères) récupérer l'ensemble des channels et user corresspondant avec [API 31 - List User Channel](../API/31_List_User_Channel.md) et afficher dans l’ordre suivant  :
		- Section "Channel" :
			- Trié alphabétiquement 
			- Avatar channel
			- Nom Channel
		- Section "User" :
			- trié alphabétiquement 
			- Avatar User
			- Username
	- Si aucun resultat message "Sorry no result came for your research"

> **Action**

- Au clic sur un resulat de type "Channel" ouverture [14 - Profil Channel](./14_Profil_Channel.md)
- Au clic sur un resulat de type "User" ouverture [14 - Profil User](./13_Profil_User.md)
- Touch Entrée ouverture du résultat dans module [15 - Recherche](./15_Recherche.md)

> **Gestion Erreur**

> **Gestion Succès**
