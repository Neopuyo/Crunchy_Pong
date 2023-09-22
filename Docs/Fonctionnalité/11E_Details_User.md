# Module Chat - Section Détails User

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 12 - Join Channel](../API/12_Join_Channel.md)
- [API 13 - Leave Channel](../API/13_Leave_Channel.md)
- [API 20 - Info User](../API/20_Info_User.md)
- [API 21 - Update User](../API/21_Update_User.md)
- [API 25 - Add Contact](../API/25_Add_Contact.md)
- [API 26 - Remove Contact](../API/26_Remove_Contact.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

Utiliser l'[API 20 - Info User](../API/20_Info_User.md) pour obtenir les données. Le module sera composé de 3 parties :

1. **Titre :**
- Justifié à Gauche
	- Avatar User
	- Username
- Justifié à Droite menu d'option avec :
	- Si User est l'utilisateur :
		- Settings
	- Si User est différent de l'utilisateur :
		- Conversation
		- Si le User n'est pas dans la list de contact :
			- Add Contact
		- Si le User est dans la list de contact :
			- Croix
			- Main

2. **Info :**
- Texte de présentation "Bio"
- Niveau
- Pourcentage de victoire
- Resultat des match (Victoire / Nul / Défaite)
- Nombre de Match

3. **Liste Channels :**
- Titre section "Channels List"
- Bouton à gauche du titre permettant d’ouvrir / réduire la section
- Si User est l'utilisateur bouton à Droite "Create Channel"
- Récupérer l'ensemble des channels et afficher dans l’ordre suivant  :
	- Trié alphabétiquement
	- Avatar Channel
	- Nom Channel

> **Action**

1. **Titre :**
- Si User est l'utilisateur :
	- Username devient champ texte pour modification puis à la touche entrée ou clic ailleurs sauvegarde avec [API 21 - Update User](../API/21_Update_User.md)
	- Settings : [13 - Profil User](./13_Profil_User.md)
- Si User est différent de l'utilisateur :
	- Si le User n'est pas dans la list de contact :
		- Conversation : ajouter contact avec [API 25 - Add Contact](../API/25_Add_Contact.md) puis ouverture [Conversation](./11C_Conversation.md)
		- Add Contact : [API 25 - Add Contact](../API/25_Add_Contact.md)
	- Si le User est dans la list de contact :
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
		- Croix : enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
		- Main : bloquer user et enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)

2. **Info :**
- Si User est l'utilisateur :
	- Texte de présentation devient champ texte pour modification puis à la touche entrée ou clic ailleurs sauvegarde avec [API 21 - Update User](../API/21_Update_User.md) uniquement si modification détecté

3. **Liste Channels :**
- Si User est l'utilisateur :
	- Create Channel : ouverture [14A - Create Channel](./14A_Create_Channel.md)
- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité :
	- Visage : ouverture [11D - Détails Channel](./11E_Details_User.md)
	- Si l'utilisateur n'est pas membre de la channel : 
		- Conversation : join la channel avec [API 12 - Join Channel](../API/12_Join_Channel.md) puis ouverture [11C - Conversation](./11C_Conversation.md)
		- Join : [API 12 - Join Channel](../API/12_Join_Channel.md)
	- Si l'utilisateur est membre de la channel :
		- Conversation : ouverture [11C - Conversation](./11C_Conversation.md)
		- Croix : quitter la channel + box confirmation voir [API 13 - Leave Channel](../API/13_Leave_Channel.md)

> **Gestion Erreur**

> **Gestion Succès**

