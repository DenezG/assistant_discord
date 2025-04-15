import { Client, IntentsBitField } from 'discord.js';
import Chat from './chat.js';
import dotenv from 'dotenv';
import { runGeminiChat } from './gemini.js';
import fs from 'fs';
import path from 'path';
dotenv.config();

//Informations aux quelles le bot a accès
const client = new Client({
    partials: [
        'CHANNEL'
    ],
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping
    ]
});

async function fetchAllMessages(channel, limit = 2000) {
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

const TARGET_USER_ID = '303985662208638978';
const TARGET_GUILD_ID = '894650071440846888';

async function collectUserMessages() {
    try {
        const guild = await client.guilds.fetch(TARGET_GUILD_ID);
        const channels = await guild.channels.fetch();

        let userMessages = [];

        for (const [channelId, channel] of channels) {
            if (channel.isTextBased() && channel.viewable && channelId !== '1361681625670353008') {
                try {
                    let messages = await fetchAllMessages(channel);
                    const userMessagesInChannel = messages.filter(msg =>
                        msg.author.id === TARGET_USER_ID &&
                        isTextOnlyMessage(msg) &&
                        !msg.content.toLowerCase().startsWith('grok') &&
                        !msg.content.startsWith('<@1250056134258065440>')
                    );
                    userMessages = userMessages.concat(userMessagesInChannel);

                    console.log(`Found ${userMessagesInChannel.length} messages in #${channel.name}`);
                } catch (error) {
                    console.error(`Error processing channel ${channel.name}:`, error.message);
                }
            }
        }

        console.log(`Total messages found from user: ${userMessages.length}`);

        let basePrompt = "Tu es un bot discord, tu dois aider les utilisateur quand ils te posent des questions. Tu dois répondre en t'inspirant de la manière dont parle le chef du serveur nommé Grok et ne fais pas que t'inspirer, prend en compte si il n'utilise pas de ponctuation ou de majuscules et fait pareil. Ne répond pas des choses insensé non plus reste logique mais soit aussi drôle et inattendu que lui. Voici ses messages, délimités entre eux par des ╤, prends exemple:";

        userMessages.forEach(msg => {
            basePrompt += ` ${msg.content} ╤`;
        });

        basePrompt = basePrompt.replaceAll("\n", '\\n').replaceAll('"', '\\"').replaceAll('/', '\\/').replaceAll('`', '');

        console.log(basePrompt);

        let jsonContent = [];
        jsonContent.push({ role: "user", parts: [{ text: basePrompt }] });
        const HISTORY_FILE = path.join(process.cwd(), 'chat_history.json');

        try {
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(jsonContent), 'utf8');
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'historique:", error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

client.on('ready', async (c) => {
    console.log(`Logged in as ${client.user.tag}`);

    await collectUserMessages(); // Uncomment this line to collect messages from TARGET_USER_ID and reset the base prompt
});

//Réponse du bot suite à un message de l'utilisateur commençant par "Grok"
client.on('messageCreate', async (message) => {
    console.log("Message reçu: " + message.content);

    if (message.author.bot) return;

    const inGrokChannel = (message.channelId === '1361681625670353008');

    if (message.content.toLowerCase().startsWith('grok') || message.content.includes('<@1250056134258065440>') || message.type === 'DM' || inGrokChannel) {
        try {
            // Utiliser Gemini au lieu d'OpenAI
            const chatResponse = await runGeminiChat(message.content);
            console.log("Réponse Index (Gemini): " + chatResponse);
            if (!chatResponse.includes('``') && chatResponse.split('\n').length > 1) {
                const splitResponse = chatResponse.split('\n');

                if (inGrokChannel) {
                    message.channel.send(splitResponse[0]);
                } else {
                    message.reply(splitResponse[0]);
                }

                for (let i = 1; i < splitResponse.length; i++) {
                    setTimeout(() => {
                        if (splitResponse[i].length > 0) message.channel.send(splitResponse[i]);
                    }, i * 100); // Envoie chaque partie avec un délai de 3 secondes
                }
            } else {
                if (inGrokChannel) {
                    message.channel.send(chatResponse);
                } else {
                    message.reply(chatResponse);
                }
            }
        } catch (error) {
            console.error("Erreur avec l'API Gemini:", error);
            message.reply("Désolé, j'ai rencontré une erreur en essayant de répondre.");
        }
    }
});

//Connexion du bot au serveur Discord
client.login(process.env.TOKEN);