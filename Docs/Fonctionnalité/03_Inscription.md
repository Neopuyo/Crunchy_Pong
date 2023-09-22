# Module Inscription

**[Retour Page Inception](./00_Page_Transcendence.md)**

# Point Ouvert
- Ajouter une barre de % de progressions de l'inscription
# API Liée
- [03 - API Création Compte](../API/03_Creation_Compte.md)
- [31 - API List User/Channel](../API/31_List_User_Channel.md)
# Regle de gestion

## Inspiration
<p align="center">
	<img src="./Inspiration/Inscription.png" />
</p>

## Etape

> **Affichage**

***1. Inscription Classique :***

Les champs s'afficher les un après les autres si ok (si ecran suffisament grand alors 2 côte à côte):
- Titre "Create Your Account"
- Champ texte "Login" :
	- utiliser [A05 - Define Name](./A05_Define_Name.md)
	- non modifiable si depuis 42 OAuth
- Champ texte "Username" : utiliser [A05 - Define Name](./A05_Define_Name.md)
- Champ texte "Nom" : 
	- non modifiable si depuis 42 OAuth
- Champ texte "Prénom" :
	- non modifiable si depuis 42 OAuth
- Champ texte "Email"
	- Checker si format email valide
- Champ texte "Téléphone"
	- Checker si format téléphone valide
- Password (Ne pas afficher si depuis 42OAuth):
	- ajouter le [module Password](./A04_Definition_Password.md)
- Bouton "Confirm"
	- au click ou touche entrée confirmer et envoyée [API 03 - Création Compte](../API/03_Creation_Compte.md)
- Texte "Already have an account?" et texte lien "Log In"

***2. Incription avec 42 OAuth :***

- Coupe la section avec "Or"
- Bouton de connexion "Login with 42" chargée module [02A - Connexion 42](./02B_Connexion_42.md)

> **Action**

- Clic bouton "Confirm" ou touche entrée
	- Checker le champ, si erreur (voir gestion erreur) si ok afficher le champ suivant
	- Si tous les champs ok alors envoyée [API 03 - Création Compte](../API/03_Creation_Compte.md)
- Clic lien "Log In" -> lien [02 - Connexion](./02_Gestion_Connexion.md) : ou au click sur la croix du navigateur si un champ remplis afficher box confirmation : 
	- Message "Your inscription will be cancel. Would you proceed?"
	- Bouton "Confirm"
	- Bouton "Back"
- Au survol / clic prévoir animation sur bouton et champ texte

> **Gestion Erreur**

- Pour champ "login" et "username" :
	- checker qu'ils soit différent
- Pour champ "Nom", "Prénom" et "Email" :
	- doivent etre remplis
- Pour champ "Email" :
	- vérifié format donc char @ suive d'un .
- Pour champ "téléphone" :
	- obligatoire si sélection [02B - double authentification](./02B_Double_Authentification.md)

> **Gestion Succès**

- Si l'ensemble est valide passer au module [03A - Vérification d'email](./03A_Verification_Email.md)
