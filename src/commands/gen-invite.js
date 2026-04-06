const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const {
  getInvite,
  setInvite,
  deleteInvite,
  getGuildSettings,
} = require("../common/db");

async function getOrCreateInvite(interaction, maxAge) {
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
    maxAge: maxAge,
    maxUses: 1,
    unique: true,
  });

  setInvite(interaction.user.id, interaction.guild.id, invite.code);
  return invite;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gen-invite")
    .setDescription("Generates a 1-time use invite link for this server."),

  async execute(interaction) {
    const settings = getGuildSettings(interaction.guild.id);

    if (!settings) {
      console.log(
        "Unitialised guild settings for guild:",
        interaction.guild.id,
      );

      return interaction.reply({
        content: "Could not fetch guild settings.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const invite = await getOrCreateInvite(
      interaction,
      settings.invite_max_age,
    );

    if (!invite)
      return interaction.reply({
        content: "Could not generate an invite.",
        flags: MessageFlags.Ephemeral,
      });

    const expiresTimestamp = invite.expiresTimestamp;
    const expiry = !expiresTimestamp
      ? "Never expires."
      : `Expires <t:${Math.floor(expiresTimestamp / 1000)}:R>.`;

    await interaction.reply({
      content: `\`${invite.url}\`\n${expiry}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
