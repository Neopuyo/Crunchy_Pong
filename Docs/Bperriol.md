# 12 mai
J'ajoute la librairie TypeOrm dans nest qui nous permet de se connect a la database postgresql. Pourquoi cette librairie, car c'est celle utilisée dans la documentation offcielle de NestJS out out est expliqué a ce lien : https://docs.nestjs.com/techniques/database

J'ajoute aussi le package class-validator qui nous permet de checker si les données recues sont comme on veut (not empty, number, string, min length, ...) lors d'une post request avant d'enregistrer les données dans la database

Donc voici comment ca fonctionne:
* Tout fonctionne dans le dossier src dans Backend pour le moment.
* Nest fonctionne en terme de modules (voir ca comme des petites applis séparées les unes des autres, un module pour le user, un module pour le chat, un module pour le game, etc...). Il faudra surement rajouter un module pour l'authentification mais pour le moment j'ai juste rajouté un module user pour tester la connection avec la database.
* Dans le module principal, dans app.module.ts, j'ai importé TypeOrmModule, qui prend en paramètre les informations de notre database. Il faudra qu'on pense a mettre des variables d'environnement (encore une fois c'est juste pour tester actuellement).
* Chaque module dans Nest utilise un controller. Le controller est la classe qui permet d'appeler toutes les routes get, post, delete, put, ... pour chaque url. Ce controller utilise un service qui est aussi une classe qui contient les methodes correspondantes.
* Le module User contient donc un user.controller.ts et un user.service.ts
* Le service de User a un contructeur qui utilise un Repository, c'est la table user dans notre database.
* La methode Get() permet d'afficher tous les users dans la database.
* La methode Post() permet d'ajouter un utilisateur dans la database. Pour utiliser ceci, vous pouvez utiliser l'extension REST client dans vs code. Une fois téléchargée vous pouvez faire des requestes dans le fichier test.http a la racine du projet (juste appuyer sur le bouton send requets aui apparait automatiquement avec l'extension).
* Cette fonction Post() utilise ce qu'on appelle un Dto (je sais plsu exactement le nom entier). Le Dto ici est dans le dossier src/users/dto. Dans ce dossier vous pouvez void le decorateur Entity() qui declare la classe comme une table de la database. Comme vous pouvez voir, c'est juste un user basique avec un id, un nickname et un password (evidemment on changera tout ca plus tard). Grace a la librairie class-transformer et class-validator, on peut ajouter des decoratuers au dessus de chaque propriete, du genre @IsNotEmpty() ou @IsNumber() qui sont tres comprehensibles. Cela nous permet de checker que les datas recues sont correctes a chaque requete POST() avant d'ajouter le user dans la table.

# 15 mai

Je rajoute la librairie @nestjs/config qui permet de configurer un module dans nest en fonction d'un fichier .env (ca nous permet de mettre le username, password, ... de la database en tant que variable d'environnement)

Je me suis renseigné sur l'authentification des users (pas par 42 ou google et tout, juste login password). Hashé le password est tres facile et checke si le password est bon semble facile aussi (bcrypt library does everything), une fois fait un json web token (jwt) est donné au client, toutes nos routes sont gardées sauf celles public (routes accessibles tant que le user n'est pas connecté). Ce jwt est envoyé dans le header à chaque fois que le user fait quelque chose, ce qui nous permet de savoir si oui ou non le user est authentifié, ets log in et peut acceder a telle page ou telle fonction. Ce token a une duréee limite (60s de base), à nous de voir comment on le gère, un epossibilité que je regardais est de le mettre à genre 5 minutes, et de créer un middleware (fonction qui intercepte les requetes avant de les executer dans NEST) qui permettrait de checker le temps restant et de donner un nouveau token au user. Ainsi, tant qu'il fait des trucs dans les cinq minutes (a voir sur le temps), il reste connecté, si pas de requete ou rien en cinq minutes, il est deco. Il faut voir avec le temps qu'on met, plus c'est long moins c'est secure mais si tu fais un truc a cote ou juste tu regardes l ecran mais tu fais rien (j en sais rien juste regarder les messages) ca te deco c'ets un peu chiant, ou alors une pop up qui dit de bouger ou deco dans 30 secondes, un truc comme ca.

A et j'ai exclut le password du user de s'afficher lors des requetes qui retournent le user. Juste au cas ou.





Double authentification
profil choisir

reparer le join pongie

creer status

profil pongies, channels
