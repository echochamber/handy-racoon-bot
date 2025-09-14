import { Request, Response } from 'express';
import {ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao, STASH_CHARACTER } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';

export const LIST_ALL_CHARACTERS_COMMAND: RESTPostAPIApplicationCommandsJSONBody  = {
  name: 'list_all_characters',
  description: 'List all characters.',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

// type: ComponentType.Container,
// accent_color: 0x5865F2, // Discord blurple as a nice accent color
const accentColors = [0x5865F2, 0x57F287, 0xEB459E]; // Discord blurple, green, pink
export async function initiate(req: Request, res: Response) {
  const characters: Character[] = await characterDao.all(db);
  res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: characters
        .filter(c => c.name !== STASH_CHARACTER.name)
        .map((character, idx) => ({
          type: ComponentType.Container,
          accent_color: accentColors[idx % 3],
          components: [{
            type: ComponentType.TextDisplay,
            content: `# ${character.name}\n > ${character.description}`,
          }]
        })),
    },
  });
}

export const listCharacter = {
  command: LIST_ALL_CHARACTERS_COMMAND,
  initiate: initiate,
}