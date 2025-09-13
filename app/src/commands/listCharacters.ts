import { Request, Response } from 'express';
import {ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';

export const LIST_ALL_CHARACTERS_COMMAND: RESTPostAPIApplicationCommandsJSONBody  = {
  name: 'list_all_characters',
  description: 'List all characters.',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export async function handleListAllCharacters(req: Request, res: Response) {
  const characters: string[] = await characterDao.all(db).then(characters => {
    if (!characters) {
      return [];
    }
    return characters.map(c => {
      return c.name
    })
  })
  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: ComponentType.TextDisplay,
          // Fetches a random emoji to send from a helper function
          content: `${characters.join('\n')}`,
        },
      ],
    },
  });
}

export const listCharacter = {
  command: LIST_ALL_CHARACTERS_COMMAND,
  list: handleListAllCharacters,
}