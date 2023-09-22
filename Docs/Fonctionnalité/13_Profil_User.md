# Module Profil User Détaillé

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert

# API Liée
- [API 20 - Info User](../API/20_Info_User.md)
- [API 25 - Add Contact](../API/25_Add_Contact.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/profil_large.png" />
</p>
<p align="center">
	<img src="./Inspiration/profil_short.png" />
</p>

## Etape

> **Affichage**

Le module profil user doit s'appeler avec un username et l'[API 20 - Info User](../API/20_Info_User.md)

Il sera composé de 3 partie :
1. **Info User :**
	- A gauche si suffisament de place
	- En premier si ecran réduit
	- Avatar :
		- si User est l'utilisateur alors bouton "Change Avatar" en bas à droite de l'avatar
		- si User n'est pas l'utilisateur alors afficher status
	- Username
	- Level
	- Si User est l'utilisateur alors bouton "Edit Profil"
	- Si User est différent de l'utilisateur afficher icone :
		- Conversation
		- Si le User n'est pas dans la list de contact :
			- Add Contact
		- Si le User est dans la list de contact :
			- Croix
			- Main
2. **Menu** permettant de naviguer dans 3 modules : Overview / Channel List / Contact List
3. Affichage du **modules** selectionnée, par défaut : Overview

> **Action**

**Info User :**
- Si User est l'utilisateur :
	- clic bouton "Change Avatar" : ouverture menu déroulant :
		- "Select Avatar" au clic : ouverture [A02 - Selection Avatar](./A02_Selection_Avatar.md)
		- "Download Avatar" au clic : ouverture [A03 - Download Avatar](./A03_Download_Avatar.md)
	- clic bouton "Edit Profil" : ouverture [13A - Edit Profil](./13A_Edit_Profil.md)
- Si User est différent de l'utilisateur :
	- Si le User n'est pas dans la list de contact :
		- Conversation : ajouter contact avec [API 25 - Add Contact](../API/25_Add_Contact.md) puis ouverture [Conversation](./11C_Conversation.md)
		- Add Contact : [API 25 - Add Contact](../API/25_Add_Contact.md)
	- Si le User est dans la list de contact :
		- Conversation : ouverture [Conversation](./11C_Conversation.md)
		- Croix : enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
		- Main : bloquer user et enlever de la liste d’amis + box confirmation voir [API 26 - Remove Contact](../API/26_Remove_Contact.md)
		
**Menu :**
- Au clic section "Overview" : ouverture [13B - Overview](./13B_Overview.md)
- Au clic section "Channel List" : ouverture [13C - Channel List](./13C_Channel_List.md)
- Au clic section "Contact List" : ouverture [13D - Contact List](./13D_Contact_List.md)

> **Gestion Erreur**

> **Gestion Succès**
