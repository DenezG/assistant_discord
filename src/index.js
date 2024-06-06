import { Client, IntentsBitField } from 'discord.js';
import  Chat  from './chat.js';
import dotenv from 'dotenv';
dotenv.config();

//Informations aux quelles le bot a accès.
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});



client.on('ready', (c) => {
    console.log(`Logged in as ${client.user.tag}`);
});

//Réponse du bot suite à un message de l'utilisateur commençant par "Compas"
client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(message.content.startsWith('Compas')) {
        const chatResponse = await Chat(message.content);
        console.log("Réponse Index: " + chatResponse);
        message.reply(chatResponse);
    }
});

//Connexion du bot au serveur Discord
client.login(process.env.TOKEN);
