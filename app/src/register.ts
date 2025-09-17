import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { config } from './config.js';
import { executeDiscordRequest } from './discord/discordAPI.js';
import { ALL_COMMANDS } from './commands/commands.js';

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
console.log(ALL_COMMANDS);
InstallGlobalCommands(config.APPLICATION_ID, ALL_COMMANDS);