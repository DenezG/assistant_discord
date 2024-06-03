import { Client, IntentsBitField } from 'discord.js';
import  Chat  from './chat.js';

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

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    if(message.content.startsWith('Compas ')) {
        const chatResponse = await Chat(message.content);
        console.log("Réponse Index: " + chatResponse);
        message.reply(chatResponse);
    }
});


client.login(process.env.DISCORD_TOKEN);
