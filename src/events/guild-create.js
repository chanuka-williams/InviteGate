const { Events } = require("discord.js");
const { initGuildSettings } = require("../common/db");

module.exports = {
  name: Events.GuildCreate,
  execute(guild) {
    initGuildSettings(guild.id);
    console.log(
      `Joined guild ${guild.name} (${guild.id}) — settings initialised.`,
    );
  },
};
