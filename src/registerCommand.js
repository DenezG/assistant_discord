import dotenv from 'dotenv';
dotenv.config();
const { REST, Routes }= require('discord.js');

const commands = [
    {
        name: 'quoi',
        description: 'Répond feur à quoi',
    },
];


const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands},
        );

        console.log('Successfully registered commands.');
    } catch (error) {
        console.error(error);
    }
})();
