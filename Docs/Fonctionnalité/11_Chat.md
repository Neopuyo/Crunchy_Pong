# Module Chat

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert
- Prévoir différenciation en avatar Channel/User + 2 partie permettant de scrool channel/contact
- Au survol des bulles / click maintenu prévoir une croix permettant de les supprimer + prévoir bouton pour tout reset
# API Liée
- [API 30 - Message](../API/30_Message.md)
- [API 31 - List User Channel](../API/31_List_User_Channel.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/Chat_Home.png" />
</p>

## Etape

> **Affichage**

Composé de 2 sections :

1. **Bande latérale à gauche**

- Icone "Home" en haut pour revenir à la section "Home"
- Liste d’icone avec avatar channel / contact en cours de conversation avec user :
	- Statuts des user en bas à droite de l’avatar (Vert = Dispo / Orange = Absent/ Rouge = inGame / Gris = Déconnecté) voir [API 31 - List User Channel](../API/31_List_User_Channel.md)
	- Si nouveaux messages afficher le nombre en rouge en haut à droite de l’avatar voir [API 30 - Message](../API/30_Message.md)

2.	**Partie principale du chat à droite**

- Composé de sous-module :
	- [11A - Home](./11A_Chat_Home.md)
	- [11B - Recherche](./11B_Recherche_Chat.md)
	- [11C - Conversation](./11C_Conversation.md)
	- [11D - Détails Channel](./11D_Details_Channel.md)
	- [11E - Détails User](./11E_Details_User.md)

> **Action**

### Général

- Si le chat est en écran partagé alors en haut a droite en permanance 2 bouton :
	- Croix : pour fermé module et ouvrir pleine écran les autres
	- fleche : pour agrandir plein écran / revenir format sur la gauche

### Bande latérale à gauche

- Au clic sur icone "Home" :
	- Afficher module Home
- Au clic sur icone "Avatar" :
	- Si non sélectionné afficher « Conversation » + donner l’impression que l’icône est sélectionnée (bande blanche grosis/réduit)
	- Si sélectionné revenir à l’affichage « Home » + désélectionné l’icone (bande blanche grosis/réduit)
- Au survol des icone "Avatar" :
	- Afficher leurs nom
	- Annimation sur la gauche (bande blanche grosis/réduit)

> **Gestion Erreur**

> **Gestion Succès**
