# Module Recherche

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 31 - List User Channel](../API/31_List_User_Channel.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/Recherche_Page.png" />
</p>

## Etape

> **Affichage**

- Icone Recherche
- Zone de recherche
- 2 sections Channel / User :
		- Afficher titre de section que si un résultat pour le type
	- Sur la base des charactères dans le champ recherche (min 3 charactères) récupérer l'ensemble des channels et user corresspondant avec [API 31 - List User Channel](../API/31_List_User_Channel.md) et afficher en tableau  :
		- Section "Channel" :
			- Trié alphabétiquement 
			- Avatar channel en gros
			- Nom Channel en dessous
		- Section "User" :
			- trié alphabétiquement 
			- Avatar User en gros
			- Username en dessous
	- Si aucun resultat message "Sorry no result came for your research"

> **Action**

- Au clic sur un resulat de type "Channel" ouverture [14 - Profil Channel](./14_Profil_Channel.md)
- Au clic sur un resulat de type "User" ouverture [14 - Profil User](./13_Profil_User.md)
- Chaque resultat disposera d'une barre d'icone s'affichant en dessous au survol ou lors d'un click maintenu: 
	- Section "Channel" :
		- Visage : ouverture [Profile Channel](./14_Profil_Channel.md)
		- Si l'utilisateur n'est pas membre de la channel :
			- Conversation : rejoindre la channel avec  [API 12 - Join Channel](../API/12_Join_Channel.md) puis ouverture [Conversation](./11C_Conversation.md)
			- Join : rejoindre la channel voir [API 12 - Join Channel](../API/12_Join_Channel.md)
		- Si l'utilisateur est membre de la channel :
			- Conversation : ouverture [Conversation](./11C_Conversation.md)
			- Croix : quitter la channel + box confirmation voir [API 13 - Leave Channel](../API/13_Leave_Channel.md)
	- Section "Contact" :
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
