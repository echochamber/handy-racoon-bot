import { DiscordRequest } from './utils.js';
import { CHALLENGE_COMMAND } from './demo/challengeCommand.js';
import { TEST_COMMAND } from './demo/testCommand.js';
import {ADD_CHARACTER_COMMAND } from './commands/addCharacter.js';
import { config } from './config.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

console.log(ADD_CHARACTER_COMMAND, CHALLENGE_COMMAND, TEST_COMMAND);
const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, ADD_CHARACTER_COMMAND];

export async function InstallGlobalCommands(appId: string | undefined, commands: RESTPostAPIApplicationCommandsJSONBody[]) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

InstallGlobalCommands(config.APPLICATION_ID, ALL_COMMANDS);