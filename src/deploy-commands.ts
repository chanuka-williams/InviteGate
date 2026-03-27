import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";
import { REST, Routes } from "discord.js";

dotenv.config();
if (!process.env.BOT_TOKEN) throw new Error("Missing BOT_TOKEN in .env");
if (!process.env.APPLICATION_ID) throw new Error("Missing APPLICATION_ID in .env");
if (!process.env.DEV_GUILD_ID) throw new Error("Missing DEV_GUILD_ID in .env");

(async () => {
    const commands = [];
    const foldersPath = path.join(__dirname, "commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(filePath);
            
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required \"data\" or \"execute\" property.`);
            }
            
        }
    }
    
    const rest = new REST().setToken(process.env.BOT_TOKEN!);
    
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID!, process.env.DEV_GUILD_ID!), { body: commands }) as unknown[];
        // const data = await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID!), { body: commands }) as unknown[]; // For global commands.
        
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
    
})();