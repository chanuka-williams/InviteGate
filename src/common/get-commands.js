import fs from "node:fs";
import path from "node:path";

export const getCommands = async (commandDir) => {
  const commands = [];
  const commandDirItems = fs.readdirSync(commandDir);

  for (const item of commandDirItems) {
    const itemFilePath = path.join(commandDir, item);
    if (fs.statSync(itemFilePath).isDirectory()) {
      try {
        commands.push(...(await getCommands(itemFilePath)));
      } catch (error) {
        console.error(
          `[ERROR] Failed to load commands from directory at ${itemFilePath}`,
          error,
        );
      }
      continue;
    }

    if (item.endsWith(".js")) {
      let command;
      try {
        command = (await import(itemFilePath)).default;
      } catch (error) {
        console.error(
          `[ERROR] Failed to load command at ${itemFilePath}`,
          error,
        );
        continue;
      }

      if ("data" in command && "execute" in command) {
        commands.push(command);
      } else {
        console.log(
          `[WARNING] The command at ${itemFilePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  return commands;
};
