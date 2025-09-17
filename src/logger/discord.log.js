'use strict';

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('ready', () => {
    console.log(`Logged is as ${client.user.tag}`);
});

const token = process.env.DISCORD_TOKEN | '';

console.log('token: ', token);

client.login(token);

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (msg.content.toLowerCase().includes('hello')) {
        msg.reply('Xin chào đại ca, em giúp gì được cho anh');
    }
});
