# Module Profil Channel

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 14 - Remove Channel Member](../API/14_Remove_Channel_Member.md)
- [API 15 - Info Channel](../API/15_Info_Channel.md)
- [API 25 - Add Contact](../API/25_Add_Contact.md)
- [API 31 - List User Channel](../API/31_List_User_Channel.md)

# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

- Récupérer l'ensemble des membres et afficher dans l’ordre suivant  :
	- Trié par rang avec section (Owner/Admin/Member)
	- Trié alphabétiquement
	- Avatar User :
		- Si membre de la channel afficher le statuts des user en bas à droite de l’avatar
	- Username

> **Action**

- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité : 
	- Visage : ouverture [User Profile](./13_Profil_User.md)
	- Si le user n'est pas dans la liste de contact de l'utilisateur : 
		- "Add Contact" : ajout à la la liste de contact voir [API 25 - Add Contact](../API/25_Add_Contact.md)
		- Conversation : add contact avec [API 25 - Add Contact](../API/25_Add_Contact.md) puis ouverture [Conversation](./11C_Conversation.md)
	- Si le user est dans la liste de contact de l'utilisateur :
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
	- Raquette : ouverture [Partie Privée](./24_Partie_Privee.md)
	- Si l'utilisateur est Admin / Owner alors : 
		- Croix : kick user de la channel + box confirmation voir [API 14 - Remove Channel Member](../API/14_Remove_Channel_Member.md)
		- Main : ban et kick user de la channel + box confirmation voir [API 14 - Remove Channel Member](../API/14_Remove_Channel_Member.md)

> **Gestion Erreur**

> **Gestion Succès**
