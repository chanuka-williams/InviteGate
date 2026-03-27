import dotenv from "dotenv";
import {Client, Events, GatewayIntentBits} from "discord.js";

dotenv.config();
if (!process.env.BOT_TOKEN) throw new Error("Missing BOT_TOKEN in .env");

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once(Events.ClientReady, (readyClient) =>
{
    console.log(`Ready! Logged in as ${readyClient.user.tag}!`);
});


client.login(process.env.BOT_TOKEN).catch(console.error);