# Module Profil User Détaillé

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 12 - Join Channel](../API/12_Join_Channel.md)
- [API 13 - Leave Channel](../API/13_Leave_Channel.md)
- [API 31 - List User Channel](../API/31_List_User_Channel.md)

# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

Récupérér la liste des channels avec [API 31 - List User Channel](../API/31_List_User_Channel.md)
- Si User est l'utilisateur Lien Icone + texte "Create Channel"
- Récupérer l'ensemble des channels et afficher dans l’ordre suivant  :
	- Trié alphabétiquement
	- Justifié à Gauche :
		- Avatar Channel
		- Nom Channel

> **Action**

- Si User est l'utilisateur :
	- Create Channel : ouverture [14A - Create Channel](./14A_Create_Channel.md)
- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité :
	- Visage : ouverture [14 - Profil Channel](./14_Profil_Channel.md)
	- Si l'utilisateur n'est pas membre de la channel : 
		- Conversation : join la channel avec [API 12 - Join Channel](../API/12_Join_Channel.md) puis ouverture [11C - Conversation](./11C_Conversation.md)
		- Join : [API 12 - Join Channel](../API/12_Join_Channel.md)
	- Si l'utilisateur est membre de la channel : Settings et Croix
		- Conversation : ouverture [11C - Conversation](./11C_Conversation.md)
		- Croix : quitter la channel + box confirmation voir [API 13 - Leave Channel](../API/13_Leave_Channel.md)

> **Gestion Erreur**

> **Gestion Succès**
