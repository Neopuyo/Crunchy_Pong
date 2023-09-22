# Module Profil User Détaillé

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert
- pour le moment je met en place un depart -> page qui donne sur le profil l'overview du profil utilisateur
  route : localhost:3000/profil  |  fichier frontend (`loumarti`)
- Je pense renommer cet onglet `PongStats` ou un truc du genre
- Ajoutter des stats fun parmi les infos de jeu `nombre de crocs réalisés` ou `total raquettes bouffées`

# API Liée
- [API 20 - Info User](../API/20_Info_User.md)
- [API 21 - Update User](../API/21_Update_User.md)

# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/" />
</p>

## Etape

> **Affichage**

- Texte de présentation "Bio" (s'il existe)
- Niveau
- Pourcentage de victoire
- Resultat des match (Victoire / Nul / Défaite)
- Nombre de Match

> **Action**

- Si User est l'utilisateur :
	- Texte de présentation devient champ texte pour modification puis à la touche entrée ou clic ailleurs sauvegarde avec [API 21 - Update User](../API/21_Update_User.md) uniquement si modification détecté
	
	*plutot dans un onglet en plus qui n'apparait que chez le proprietaire ? Afin d'avoir les infos game d'abord*

> **Gestion Erreur**

> **Gestion Succès**
