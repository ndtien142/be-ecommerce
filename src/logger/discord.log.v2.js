'use strict';

const { Client, GatewayIntentBits } = require('discord.js');

const { DISCORD_TOKEN, DISCORD_CHANNEL_ID } = process.env;
console.log('DISCORD_TOKEN = ', DISCORD_TOKEN);
console.log('DISCORD_CHANNEL_ID = ', DISCORD_CHANNEL_ID);

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
        // add channel ID
        this.channelId = DISCORD_CHANNEL_ID;

        this.client.on('ready', () => {
            console.log(`Logged is as ${this.client.user.tag}`);
        });

        this.client.login(DISCORD_TOKEN);
    }

    sendToMessage(message = message) {
        const channel = this.client.channels.cache.get(this.channelId);

        if (!channel) {
            console.error(`Couldn't find the chanel...`, this.channelId);
            return;
        }

        channel.send(message).catch((e) => console.error(e));
    }

    sendToFormatCode({
        title = 'Logger example',
        message = 'This is some additional information about the code.',
        code,
    }) {
        if (1 === 1) {
            // condition check environment need log
        }
        const codeMessage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16), // convert hexadecimal color code to integer,
                    title,
                    description:
                        '```json\n' + JSON.stringify(code, null, 2) + '\n```',
                },
            ],
        };
        const channel = this.client.channels.cache.get(this.channelId);
        if (!channel) {
            console.error(`Couldn't find the chanel.`, this.channelId);
            return;
        }
        // Message use CHAT GPT API CALL
        channel.send(codeMessage).catch((e) => console.error(e));
    }
}

module.exports = new LoggerService();
