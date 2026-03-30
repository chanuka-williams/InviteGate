const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gen-invite")
    .setDescription(
      "Generates a 1 time use invite link to the guild that expires in 24 hours.",
    ),
  async execute(interaction) {
    const inviteLink = await interaction.channel.createInvite({
      maxAge: 86400,
      maxUses: 1,
      unique: true,
    });

    await interaction.reply({
      content: inviteLink.url,
      ephemeral: true,
    });
  },
};
