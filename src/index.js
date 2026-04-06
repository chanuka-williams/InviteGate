const path = require("node:path");
const dotenv = require("dotenv");
const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  MessageFlags,
} = require("discord.js");

const { validateEnv } = require("./common/validate-env");
const { getCommands } = require("./common/get-commands");
const { initGuildSettings } = require("./common/db");

dotenv.config();
validateEnv();

if (!process.env.BOT_TOKEN) throw new Error("Missing BOT_TOKEN in .env");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

client.once(Events.ClientReady, (readyClient) => {
  client.guilds.cache.forEach((g) => initGuildSettings(g.id));
  console.log(`Ready! Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

async function loadCommands() {
  const commands = await getCommands(path.join(__dirname, "commands"));

  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }
}

async function main() {
  await loadCommands();
  await client.login(process.env.BOT_TOKEN);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
