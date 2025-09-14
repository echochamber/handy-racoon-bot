import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { addItem } from './commands/magicItem/createItem.js';
import { attuneItem } from './commands/magicItem/attuneItem.js';
import { characterRoot } from './commands/character/characterRoot.js';
import { listAttunements } from './commands/character/listAttunements.js';
import { listMagicItems } from './commands/character/listMagicItems.js';
import { transferItem } from './commands/magicItem/transferItem.js';
import { unattuneItem } from './commands/magicItem/unattuneItem.js';
import { config } from './config.js';
import { TEST_COMMAND } from './demo/testCommand.js';
import { executeDiscordRequest } from './discord/discordAPI.js';
import { magicItemRoot } from './commands/magicItem/magicItemRoot.js';

const ALL_COMMANDS = [
  TEST_COMMAND,
  magicItemRoot.command,
  characterRoot.command,
];
console.log(ALL_COMMANDS);

export async function InstallGlobalCommands(appId: string, commands: RESTPostAPIApplicationCommandsJSONBody[]) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint:
    // https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await executeDiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

InstallGlobalCommands(config.APPLICATION_ID, ALL_COMMANDS);