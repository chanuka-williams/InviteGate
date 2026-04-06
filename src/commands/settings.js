const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const {
  initGuildSettings,
  setInviteMaxAge,
  getGuildSettings,
} = require("../common/db");

/**
 * @param input - Duration with unit: s, m, h, d (e.g. 30m)
 * @returns Duration in seconds, or null if invalid
 */
function parseDuration(input) {
  const match = input.trim().match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure server settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName("set")
        .setDescription("Update a setting.")
        .addSubcommand((sub) =>
          sub
            .setName("invite-expiry")
            .setDescription(
              "How long generated invite links last (e.g. 30m, 6h, 1d, 0s for never).",
            )
            .addStringOption((option) =>
              option
                .setName("duration")
                .setDescription("Duration with unit: s, m, h, d (e.g. 30m)")
                .setRequired(true),
            ),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName("get")
        .setDescription("Get a setting.")
        .addSubcommand((sub) =>
          sub
            .setName("invite-expiry")
            .setDescription(
              "How long generated invite links last (e.g. 30m, 6h, 1d, 0s for never).",
            ),
        ),
    ),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();

    if (group === "set" && sub === "invite-expiry") {
      const input = interaction.options.getString("duration");
      const seconds = parseDuration(input);

      if (seconds === null) {
        return interaction.reply({
          content:
            "Invalid duration. Use a number followed by `s`, `m`, `h`, or `d` — e.g. `30m`, `6h`, `0s`.",
          flags: MessageFlags.Ephemeral,
        });
      }

      initGuildSettings(interaction.guild.id);
      setInviteMaxAge(interaction.guild.id, seconds);

      return interaction.reply({
        content: `Invite expiry updated to \`${input === "0s" ? "never" : input}\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (group === "get" && sub === "invite-expiry") {
      const settings = getGuildSettings(interaction.guild.id);
      const duration =
        settings.invite_max_age === 0 ? "never" : `${settings.invite_max_age}s`;

      return interaction.reply({
        content: `Invite expiry is currently set to <t:${Math.floor(Date.now() / 1000) + settings.invite_max_age}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
