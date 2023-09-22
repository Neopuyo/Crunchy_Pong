# Module Chat - Section Home

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert
- bouton de création rapide de conversation ouvrant le module conversation avec un champ de recherche a la place du titre permettant d'afficher en menu déroulant les user/channel

# API Liée
- [API 13 - Leave Channel](../API/13_Leave_Channel.md)
- [API 26 - Remove Contact](../API/26_Remove_Contact.md)
- [API 31 - List User Channel](../API/31_List_User_Channel.md)

# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/Chat_Home.png" />
</p>

## Etape

> **Affichage**

- Zone de recherche en haut : au click ouvrir [11 B - Recherche Chat](./11B_Recherche_Chat.md)
- 2 section avec un bouton à gauche du titre permettant d’ouvrir / réduire la section
- Récupérer l'ensemble des Channels et user liée à l'utilisateur (Contact) avec [API 31 - List User Channel](../API/31_List_User_Channel.md) et afficher dans l’ordre suivant  :
	- Section "Channel" :
		- Trié alphabétiquement 
		- Avatar channel : 
			- Si nouveaux messages afficher le nombre en rouge en haut à droite de l’avatar voir [API 31 - List User Channel](../API/31_List_User_Channel.md)
		- Nom Channel
	- Section "Contact" (User liée à l'utilisateur) :
		- trié par statut puis alphabétiquement 
		- Avatar User : 
			- Statuts des user en bas à droite de l’avatar voir [API 31 - List User Channel](../API/31_List_User_Channel.md)
			- Si nouveaux messages afficher le nombre en rouge en haut à droite de l’avatar voir [API 31 - List User Channel](../API/31_List_User_Channel.md)
		- Username
- Sur la ligne section "channel" justifié à droite Bouton "Create Channel"

> **Action**

- Sur la ligne d'une channel / d'un user :
	- Au clic ouverture [Conversation](./11C_Conversation.md) 
	- Au clic droit ou clic maintenu ou survol sur la droite : afficher menu déroulant d’icone venant de la droite
- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité s'affichant si clic maintenu ou survol sur la partie droite ou bouton 3 petit point: 
	- Section "Channel" :
		- Visage : ouverture [Détails Channel](./11D_Details_Channel.md)
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
		- Settings : ouverture [Edit Channel](./14_Profil_Channel.md)
		- Croix : quitter la channel + box confirmation voir [API 13 - Leave Channel](../API/13_Leave_Channel.md)
	- Section "Contact" :
		- Visage : ouverture [Détails User](./11E_Details_User.md)
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
		- Raquette : ouverture [Partie Privée](./24_Partie_Privee.md)
		- Croix : enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
		- Main : bloquer user et enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
- Au clic bouton "Create Channel" ouverture [14A - Create Channel](./14A_Create_Channel.md)

> **Gestion Erreur**

> **Gestion Succès**

