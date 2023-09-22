# TO DO LIST

[~] : facultatif
<br/>
[!] : important |
<br/>
[ ] : a faire |
<br/>
[+] : bonus |
<br/>
[x] : fait
<br/>

> Game

- [!] Parfois quitter une game fait planter et redemarer le backend (pas reussi a trouver un test qui le fait crash a 100%)
- [+] Ajouter des boutons pour déplacer le paddle pour que je puisse jouer aussi avec ma tablette ! (@Bboisson elle te plait trop mon idée je suis sur 😂 ! Loup)

- [!] Apres une invitation, ca m'emmene sur la partie directement en attendant que quelqu'un join. Si j'annule en cliquant sur la croix et que quelqu'un join, il ne peut pas rejoindre, ca throw une exception et ca lui met un message d'erreur.
- [x] timer 4s or 2s in the game but not the same time => ok cest mon ordi qui a deux secondes davance chais pas pk
- [!] probleme avec l'xp donne par les achievments
- [!] [assez_souvent] A l'acces a une partie le jeu ne s'affiche pas chez un des deux joueurs
- [!] [parfois] Au moment de quitter il y a juste un retour home la partie reste en jeu
- [x] 2 onglet log sur le meme compte en partie league contre un autre joueur -> un onglet qui quitte proc deco + errorReact? (le joueur a un seul onglet quitte c'est ok) C'est lorsque le 1er onglet arrive dans le jeu qui quitte que ca provoque le pb
- [~] Une invitation

> Pour qui veut s'en charger ou pour tous

- [!] penser a enlever les consoles.logs ajoutes (ex les sockets)

- [x] Affichage bouton "log out" sur une ligne au lieu de deux
- [x] Se renseigner sur commment creer la db sans passer par le synchronize a switch
- [x] error ESLINT next/babel quand on compile en build
- [x] all warning after make flcean (depedencies)

- [x] font size letters create page in avatar text

- [x] Nettoyer ou n'afficher qu'en dev tous les consoles.log
- [x] Error while fetching api: avatar at url: 3/false. Error log: fetched failed at http://backend:4000/api/avatar/3/false (log du front depuis la home page)
- [x] Return to Home Page module erreur pb d'affichage (le CSS ? et l'histoire du query ?)
- [!] [parfois] probleme de deco : token not valid!
- [!] Return to Home Page module erreur pb d'affichage (le CSS ? et l'histoire du query ?)

> Bperriol

- [x] CSS du badge a agrandir
- [x] enlever la validation xp des achievement au public
- [x] Le bouton join devrait s'afficher que sur la plus recente invitation dans un chat
- [x] chatbutton notif invitation, double notif!
- [x] cancel invitation does not delete the notif
- [x] une channel privee devrait s'afficher dans la searchBar lorsque l'utilisateur est invite
- [x] 2 mm user sur la page login, cree un loading infini
- [x] Notif perso en trop lorsque invitation en game (broadcast)
- [x] empecher de pouvoir spam l'invitation pongie (toast en boucle)
- [x] invite pongies de Party
- [x] chercher un nom de channel, lorsque test est privee et qu'on ecrit 't' dans la barre
      (Il y a peut etre eu une demande d'ami puis un ban un truc du genre). Rien de dramatique je note si tu arrive a reproduire le pb
      J'essaye de reproduire mais je trouve pas il faudrait qu'on arrive à trouver dans quel ca precis ca arrive
- [x] check le temps du verified code depuis la mise a jour des temps dans la db
- [x] achievement les demos sont compte avec le niveau du joueur !! @_@'
- [x] console.log d'un user apres creation (passe par 42)
- [~] Apres les tests faits hiers, j'ai une notif (badge rouge) sur l'avatar de la nav bar, qui disparait qaund je vais dans l'onglet pongies mais qui repop ensuite
- [~] La notif des achievement disparait mais ne revient pas au moment du level up qui arrive au meme moment
- [x] pb de css de la barre en bas de certains input en border-bottom

> Loumarti

- [!] SetUpSectionPongers error : Error: getPongersData user relation issue // SetUpChannelSecondPart.tsx:123:16 => erreure a surveiller si reproc
      proc pdt des tests ban / kick invite channel depuis chat (en dev)
- [x] invitation depuis le 3e onglet channel ne proc pas d'invit (badge channel (1)) => need help => non c'est ok j'ai reussi tout seul :D !
- [x] Si j'ai la motiv un logo-icon pour remplacer la raquette de ping pong (+ favicon ?) => Rofl cte qualite de travail ! Trop cool ca :D
- [x] Amelioration de l'affichage du story  
- [x] Le prompt reste a la taille du dernier message envoye => c'est ok
- [x] verifier mes switch (breaks !) => ok j'utilisais des return lorsque pas de break no problemo
- [x] Barre des achievement a refaire pour pas avoir de soucis de dependences
- [x] WsException: Object { status: "error", message: "Forbidden resource" } => inviation a une game de Jiji vers loup ... dans le cas 2 onglets : Mozilla & MozillaPrivate
  Probleme besoin d'avoir un message prive avant d'envoyer une invitation de jeu
- [x] fonction a extraire pour etre plus propre dans le forceJoinPrivateMessage
- [x] t.story is null ! // TypeError: t.story is null => match
- [~] Channel relation notif ~ effet clignotement des notifs pb affichage (dans la db tout est ok)
