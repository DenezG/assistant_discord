# Assistant Discord

Ce projet est basé sur un [tutoriel YouTube](https://www.youtube.com/watch?v=KZ3tIGHU314) qui explique comment créer un assistant Discord.

## Cloner le dépôt Git

Pour commencer, clonez le dépôt Git en utilisant la commande suivante :

```bash
git clone https://github.com/DenezG/assitant_discord.git
cd assistant_discord
```

## Configuration

Créez un fichier `.env` à la racine du projet et insérez-y les informations nécessaires :

```
TOKEN= 'MT...' # Bot Token
CLIENT_ID= '12...' # Bot ID
GUILD_ID= '12...' # Discord Server ID, utile uniquement si vous utilisez les /commandes
OPENAI_API_KEY = 'sk-proj-...'
ASSISTANT_ID = 'asst_...'
```

## Installation des dépendances

Installez les dépendances nécessaires avec npm :

```bash
npm install
```

## Installation de nodemon

Installez `nodemon` globalement pour faciliter le développement :

```bash
npm install -g nodemon
```

## Lancement du BOT

Pour lancer le bot, utilisez la commande suivante :

```bash
nodemon
```
```

Suivez ces étapes pour configurer et démarrer votre assistant Discord. Si vous avez des questions ou des problèmes, consultez le tutoriel YouTube ou la documentation associée.
```

