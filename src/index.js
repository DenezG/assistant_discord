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

async function fetchAllMessages(channel, limit = 1000) {
    let messages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const fetchedMessages = await channel.messages.fetch(options);
        if (fetchedMessages.size === 0) break;

        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastId = fetchedMessages.last().id;

        if (messages.length >= limit) break;
    }

    return messages;
}

function isTextOnlyMessage(message) {
    return (
        message.content.trim().length > 0 &&  // Has actual text content
        message.attachments.size === 0    // No files
    );
}

const TARGET_USER_ID = '172039801145524224';
const TARGET_GUILD_ID = '894650071440846888';

async function collectUserMessages() {
    try {
        const guild = await client.guilds.fetch(TARGET_GUILD_ID);
        const channels = await guild.channels.fetch();

        let userMessages = [];

        for (const [channelId, channel] of channels) {
            if (channel.isTextBased() && channel.viewable) {
                try {
                    let messages = await fetchAllMessages(channel);
                    const userMessagesInChannel = messages.filter(msg =>
                        msg.author.id === TARGET_USER_ID &&
                        isTextOnlyMessage(msg)
                    );
                    userMessages = userMessages.concat(userMessagesInChannel);

                    console.log(`Found ${userMessagesInChannel.length} messages in #${channel.name}`);
                } catch (error) {
                    console.error(`Error processing channel ${channel.name}:`, error.message);
                }
            }
        }

        console.log(`Total messages found from user: ${userMessages.length}`);

        let basePrompt = "Tu es un bot discord, tu dois aider les utilisateur quand ils te posent des questions. Tu dois répondre en t'inspirant de la manière dont parle le chef du server nommé hamster des poussières. Ne répond pas des choses insensé non plus reste logic et utile mais soit aussi drôle et inattendu que lui. Voici ses messages, délimités entre eux par des ╤, prends exemple:";

        userMessages.forEach(msg => {
            basePrompt += ` ${msg.content} ╤`;
        });

        console.log(basePrompt);

        let jsonContent = JSON.parse('');
        jsonContent.push({ role: "user", parts: [{ text: basePrompt }] });
    } catch (error) {
        console.error('Error:', error);
    }
}

client.on('ready', (c) => {
    console.log(`Logged in as ${client.user.tag}`);

    collectUserMessages();
});

//Réponse du bot suite à un message de l'utilisateur commençant par "Grok"
client.on('messageCreate', async (message) => {
    console.log("Message reçu: " + message.content);
    if (message.author.bot) return;
    if (message.content.startsWith('Grok') || message.content.startsWith('grok') || message.content.startsWith('GROK') || message.content.includes('<@1250056134258065440>')) {
        try {
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