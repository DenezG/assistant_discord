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


client.login('MTI0NTI4MDgxOTA2OTcxNDQ3Mw.G_YVMb.tmSW8dV2daD-7RNWNEjf6PYeMauh9YHPsK_Yv4');