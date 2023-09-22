# CRUNCHY PONG

```
Journal de bord - ft_transcendence
Crunchy Team : bboisson tquere bperriol loumarti
```

## mercredi 10 mai

- Creation officielle de la `Crunchy team`
- Prise de connaissance du sujet, organisation en deux premiers objectifs
  - **Maquette** -> _bboisson & loumarti_
  - **Docker-compose** -> _bperriol & tquere_

> La `maquette` est realisée sur papier au depart, l'objectif est d'avoir
> un rendu visuel a lier aux informations codes (breakpoint, couleurs, endpoint ...)

> le but de la partie `docker-compose` est tout d'abord de monter un environnement
> simple avec 3 conteneurs (front + back + data)

## vendredi 12 mai

- La team `maquette` prend en main l'appli web figma, en collabaratif, premiers screens pret a etre echangés
- la team `docker-compose` a reussi leur 1ere connection des 3 conteneurs avec `la database PostGreSQL` fonctionnelle

## lundi 15 mai

- Point sur la `Doc` markdown realisee par `bboisson` avant son depart en vacances.
- Premieres recherches d'info sur `OAuth 42`

## vendredi 26 mai

- Creation de la `Crunchy Team` sur l'intra !
- `Authentification OAuth 42` + `JWT` mis en place par `bperriol`

## Mardi 6 juin

- `loumarti` se jette a l'eau : 13_Profil_User --- > 13B_Overview

## lundi 12 juin

- Bapt m'accompagne dans le front-end pour enregister motto + story
- travail avec bad-words pour filtrer insultes (le module est present pour le moment en double dans le back + end)

## lundi 19 juin

- correction de crash avec bad-words (necessite un caractere alphanum minimum)
- 1ers essais avec React-color installe dans le front pour editer l'avatar dans la partie profile

## mardi 27 juin

- Decouverte des `websocket`, implantation du `module gateway` dans le backend.

  > Le Gateway ecoute des `events` (ex this.server.on('connection'))
  > <br />
  > Il possede une liste des `connectedUsers = new Map<userId, socket.id>()` > <br />
  > Cote front on cree un socket avec `io`, on peut passer des objet via `query`, les event a ecouter sont place dans un useEffect()

- Lien avec la Database, creation d'une table Channel
  > La table channel a une `relationship many-to-many` avec la table users (voir dans utils/typeorm/ les entity.ts)
  > <br />
  > Une table de jonction est cree automatiquement ` @JoinTable()`
  > <br />
  > Cette relationship oblige a utiliser `save` au lieu de `update` pour mettre a jour un user (mais pas dans tou les cas, ca doit plus etre lorsque on touche au tableau de channel du user)

## jeudi 29 juin

  - Subteam `loumarti` + `bperriol` : travail en duo (pilote par bperriol) sur le chat puis repartition du travail pour la 1ere semaine de piscine de juillet

  > `bperriol` &nbsp; &nbsp; &nbsp; : &nbsp; &nbsp; &nbsp; `<ChatHome />`
  <br>
  > `loumarti` &nbsp; &nbsp; &nbsp; : &nbsp; &nbsp; &nbsp; `<ChatPrivateMsg />`

## samedi 15 juillet

  - Le `Chat` progresse bien. Les channels privateMsg deviennent des channels comme les autres qui seront differenciees avec : <br> `type: 'public' | 'protected' | 'private' | 'privateMsg'`
  - Le type `Message` contient la `Channel` cible, le `User` emetteur et un booleen indiquant si c'est une notification du serveur.
  - Les relations entre les tables fonctionnent bien, utilisation de tables e joonction customisees pour ajoutter des proprietes de status aux relations. (ex : banned, invited, joined)
  - week-end de clean et reorganisation de fichiers, fix de petits pbs.
  - Creation d'un `@UseGuard` pour les `Channel` afin de verifier automatiquement que l'user en fait partie.
  > prochaines etapes : channel qui ne sont pas de type msgPrivate + automatiser les join des channels + fonctionnememt de 'notifs'
