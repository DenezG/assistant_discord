import { Client, IntentsBitField } from 'discord.js';
import Chat from './chat.js';
import dotenv from 'dotenv';
import { runGeminiChat } from './gemini.js';
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

//Réponse du bot suite à un message de l'utilisateur commençant par "Grok"
client.on('messageCreate', async (message) => {
    console.log("Message reçu: " + message.content);
    if(message.author.bot) return;
    if(message.content.startsWith('Grok') || message.content.startsWith('grok') || message.content.startsWith('GROK') || message.content.includes('<@1250056134258065440>')) {        try {
            // Utiliser Gemini au lieu d'OpenAI
            const chatResponse = await runGeminiChat(message.content);
            console.log("Réponse Index (Gemini): " + chatResponse);
            message.reply(chatResponse);
        } catch (error) {
            console.error("Erreur avec l'API Gemini:", error);
            message.reply("Désolé, j'ai rencontré une erreur en essayant de répondre.");
        }
    }
});

//Connexion du bot au serveur Discord
client.login(process.env.TOKEN);