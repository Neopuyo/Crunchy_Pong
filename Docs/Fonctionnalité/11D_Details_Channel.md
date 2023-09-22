# Module Chat - Section Détails Channel

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 11 - Update Channel](../API/11_Update_Channel.md)
- [API 12 - Join Channel](../API/12_Join_Channel.md)
- [API 14 - Remove Channel Member](../API/14_Remove_Channel_Member.md)
- [API 15 - Info Channel](../API/15_Info_Channel.md)
- [API 25 - Add Contact](../API/25_Add_Contact.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

Utiliser l'[API 15 - Info Channel](../API/15_Info_Channel.md) pour obtenir les données. Le module sera composé de 3 parties :
1. **Titre :**
- Justifié à Gauche
	- Avatar Channel
	- Nom Channel
- Justifié à Droite menu d'option avec :
	- Conversation 
	- Si l'utilisateur n'est pas membre de la channel : 
		- Join
	- Si l'utilisateur est membre de la channel :
		- Settings
		- Croix

2. **Info :**
- Texte "Channel Description"
- Nombre d'utilisateur
- Pourcentage de victoire
- Resultat des match (Victoire / Nul / Défaite)
- Plus haut niveau

3. **Liste des membres :**
- Titre section "Membres"
- Bouton à gauche du titre permettant d’ouvrir / réduire la section
- Récupérer l'ensemble des membres et afficher dans l’ordre suivant  :
	- Trié par rang avec section (Owner/Admin/Member)
	- Trié alphabétiquement
	- Avatar User :
		- Si membre de la channel afficher le statuts des user en bas à droite de l’avatar
	- Username

> **Action**

1. **Titre :**
- Si Utilisateur est Admin/Owner :
	- Nom Channel au clic devient champ texte pour modification avec sous-module [A05 - Define Name](./A05_Define_Name.md) puis à la touche entrée ou clic ailleurs sauvegarde avec [API 11 - Update Channel](../API/11_Update_Channel.md)
- Si l'utilisateur n'est pas membre de la channel : 
	- Conversation : join la channel avec [API 12 - Join Channel](../API/12_Join_Channel.md) puis ouverture [11C - Conversation](./11C_Conversation.md)
	- Join : [API 12 - Join Channel](../API/12_Join_Channel.md)
- Si l'utilisateur est membre de la channel : 
	- Conversation : ouverture [11C - Conversation](./11C_Conversation.md)
	- Si Utilisateur est Admin/Owner : Settings : ouverture [14 - Profil Channel](./14_Profil_Channel.md) mode modification
	- Croix : quitter la channel + box confirmation voir [API 13 - Leave Channel](../API/13_Leave_Channel.md)

2. **Info :**
- Si Utilisateur est Admin/Owner :
	- Texte "Channel Description" au clic devient champ texte pour modification puis à la touche entrée ou clic ailleurs sauvegarde avec [API 11 - Update Channel](../API/11_Update_Channel.md) uniquement si modification détecté

3. **Liste des membres :**
- Chaque ligne disposera d'un menu déroulant d'icone pour lien vers fonctionnalité : 
	- Visage : ouverture [Détails User](./11E_Details_User.md)
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

