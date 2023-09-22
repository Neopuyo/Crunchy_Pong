# Module Profil User Détaillé

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 25 - Add Contact](../API/25_Add_Contact.md)
- [API 26 - Remove Contact](../API/26_Remove_Contact.md)
- [API 31 - List User Channel](../API/31_List_User_Channel.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

Récupérér la liste des channels avec [API 31 - List User Channel](../API/31_List_User_Channel.md) et les afficher :
- trié alphabétiquement 
- Avatar User : 
	- Statuts des user en bas à droite de l’avatar voir [API 31 - List User Channel](../API/31_List_User_Channel.md)
- Username

> **Action**

- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité : 
	- Visage : ouverture [Profil User](./13_Profil_User.md)
	- Si le user n'est pas dans la liste de contact de l'utilisateur : 
		- "Add Contact" : ajout à la la liste de contact voir [API 25 - Add Contact](../API/25_Add_Contact.md)
		- Conversation : add contact avec [API 25 - Add Contact](../API/25_Add_Contact.md) puis ouverture [Conversation](./11C_Conversation.md)
	- Si le user est dans la liste de contact de l'utilisateur :
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
		- Croix : enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
		- Main : bloquer user et enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)

> **Gestion Erreur**

> **Gestion Succès**
