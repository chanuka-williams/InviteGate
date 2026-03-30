const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { getInvite, setInvite, deleteInvite } = require("../common/db");

function formatDuration(seconds) {
  if (seconds == 0) return "forever";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours == 0) return `${minutes} minute${minutes != 1 ? "s" : ""}`;
  if (minutes == 0) return `${hours} hour${hours != 1 ? "s" : ""}`;
  return `${hours} hour${hours != 1 ? "s" : ""} ${minutes} minute${minutes != 1 ? "s" : ""}`;
}

async function getOrCreateInvite(interaction) {
  const channel = interaction.channel ?? interaction.guild.systemChannel;
  if (!channel) return null;

  const existing = getInvite(interaction.user.id, interaction.guild.id);

  if (existing) {
    const guildInvites = await interaction.guild.invites.fetch();
    const live = guildInvites.get(existing.invite_code);

    if (live) return live;
    deleteInvite(interaction.user.id, interaction.guild.id);
  }

  const invite = await channel.createInvite({
    maxAge: process.env.DISCORD_INVITE_EXPIRE_TIME,
    maxUses: 1,
    unique: true,
  });

  setInvite(interaction.user.id, interaction.guild.id, invite.code);
  return invite;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gen-invite")
    .setDescription(
      `Generates a 1 time use invite link to the guild that expires in ${formatDuration(process.env.DISCORD_INVITE_EXPIRE_TIME)}.`,
    ),
  async execute(interaction) {
    const invite = await getOrCreateInvite(interaction);

    if (!invite)
      return interaction.reply({
        content: "Could not generate an invite.",
        ephemeral: true,
      });

    await interaction.reply({
      content: `\`${invite.url}\`\nExpires <t:${invite.expiresTimestamp / 1000}:R>.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
