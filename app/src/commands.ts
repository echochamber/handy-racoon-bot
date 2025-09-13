import { CHALLENGE_COMMAND } from './demo/challengeCommand.js';
import { TEST_COMMAND } from './demo/testCommand.js';
import { addCharacter } from './commands/addCharacter.js';
import { config } from './config.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { listCharacter } from './commands/listCharacters.js';
import { DiscordRequest } from './util/discordAPI.js';
import { addItem } from './commands/addItem.js';
import { attuneItem } from './commands/attuneItem.js';
import { listAttunements } from './commands/listAttunements.js';

const ALL_COMMANDS = [
  TEST_COMMAND, CHALLENGE_COMMAND, addCharacter.command, listCharacter.command,
  addItem.command, attuneItem.command, listAttunements.command];
console.log(ALL_COMMANDS);

export async function InstallGlobalCommands(appId: string, commands: RESTPostAPIApplicationCommandsJSONBody[]) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

InstallGlobalCommands(config.applicationId, ALL_COMMANDS);