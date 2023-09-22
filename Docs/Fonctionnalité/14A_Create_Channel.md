# Module Profil Channel

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

Module semblable au [14 - Profil Channel](./14_Profil_Channel.md) mais avec uniquement 3 parties : 
1. **Info Channel** :
	- A gauche si suffisament de place
	- En premier si ecran réduit
	- Avatar Channel :
		- Avatar par défaut affiché
		- Bouton "Change Avatar" en bas à droite de l'avatar
	- Champ texte Nom Channel oblicatoire
	- Bouton "Create"
	- Bouton "Cancel"
		
2. **Menu** mais uniquement module : Overview
3. Affichage champ texte "Channel Description" comme dans modules [14B - Overview](./14B_Overview.md)

> **Action**

- Champ "Channel Name" avec sous-module [A05 - Define Name](./A05_Define_Name.md)
- Au clic Bouton "Create" si Nom Channel ok alors Créer Channel avec [API 10 - Create Channel](../API/10_Create_Channel.md)
- Clic bouton "Cancel" ou sur la croix du navigateur afficher box confirmation et blocker modification du reste : 
	- Message "Your modification will be cancel. Would you proceed?"
	- Bouton "Confirm" -> fermer module et revenir [10 - Home Connected](./10_Home_Connected.md)
	- Bouton "Back" -> fermer box et permettre modification

> **Gestion Erreur**

> **Gestion Succès**
