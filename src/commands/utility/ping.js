import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns \"pong!\" if bot is online!");

export async function execute(interaction: ChatInputCommandInteraction){
    try {
        await interaction.reply({ content: "pong!", flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error(error);
    }
}