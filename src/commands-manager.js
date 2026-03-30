const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { REST, Routes } = require("discord.js");
const { validateEnv } = require("./validate-env");

dotenv.config();
validateEnv();

const argv = process.argv.slice(2);
const args = {
  deploy: argv.includes("--deploy") || argv.includes("-d"),
  undeploy: argv.includes("--undeploy") || argv.includes("-u"),
  global: argv.includes("--global") || argv.includes("-g"),
};

const getCommands = (commandDir) => {
  const commands = [];
  const commandDirItems = fs.readdirSync(commandDir);

  for (const item of commandDirItems) {
    const itemFilePath = path.join(commandDir, item);
    if (fs.statSync(itemFilePath).isDirectory()) {
      commands.push(...getCommands(itemFilePath));
      continue;
    }

    if (item.endsWith(".js")) {
      let command;
      try {
        command = require(itemFilePath);
      } catch (error) {
        console.error(
          `[ERROR] Failed to load command at ${itemFilePath}`,
          error,
        );
        continue;
      }

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${itemFilePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  return commands;
};

const printHelpMessage = () => {
  console.log("Usage:");
  console.log(
    "  node commands-manager.js --deploy         # deploy to dev guild",
  );
  console.log("  node commands-manager.js --deploy --global # deploy globally");
  console.log(
    "  node commands-manager.js --undeploy        # clear dev guild commands",
  );
  console.log(
    "  node commands-manager.js --undeploy --global # clear global commands",
  );
};

const main = async () => {
  if (!args.deploy && !args.undeploy) {
    printHelpMessage();
    process.exit(0);
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN);

  if (args.undeploy) {
    if (args.global) {
      await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
        body: [],
      });
      console.log("Cleared all global commands.");
    } else {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.APPLICATION_ID,
          process.env.DEV_GUILD_ID,
        ),
        { body: [] },
      );
      console.log("Cleared all guild commands.");
    }
    return;
  }

  if (args.deploy) {
    const commands = getCommands(path.join(__dirname, "commands"));

    console.log(`Deploying ${commands.length} command(s)...`);

    if (args.global) {
      const data = await rest.put(
        Routes.applicationCommands(process.env.APPLICATION_ID),
        { body: commands },
      );
      console.log(`Deployed ${data.length} command(s) globally.`);
    } else {
      const data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.APPLICATION_ID,
          process.env.DEV_GUILD_ID,
        ),
        { body: commands },
      );
      console.log(`Deployed ${data.length} command(s) to dev guild.`);
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
