import { Request, Response } from 'express';
import {
  APIInteraction,
  APIMessageComponentSelectMenuInteraction,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ComponentType,
  InteractionContextType,
  InteractionResponseType,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import display from '@/commands/display.js';
import { magicItemDao } from '@/storage/entities/magicItem.js';

export const SHOW_CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'show_character',
  description: 'Show details for a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ],
  integration_types: [
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ],
};
export const SELECT_CHARACTER_ID = 'show_character_select_character';

export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);
  const characterOptions = characters.map((c) => ({
    label: c.name,
    value: c.meta?.id,
  }));
  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      title: 'Select Character',
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.StringSelect,
              custom_id: SELECT_CHARACTER_ID,
              min_values: 1,
              max_values: 1,
              options: characterOptions,
              placeholder: 'Character',
              required: true,
            },
          ],
        },
      ],
    },
  });
}

export async function handleCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'No character selected.',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  const selectedCharacterId = comp.data.values[0];

  const [character, items] = await Promise.all([
    characterDao.find(db, selectedCharacterId),
    magicItemDao.findByCharacter(db, selectedCharacterId)]
  );
  if (!character) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Character not found.',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  // Customize this string with whatever character details you want to show

  return res.send(display.detailedCharacterMessage(character,items));
}

export const showCharacter = {
  command: SHOW_CHARACTER_COMMAND,
  select_character_id: SELECT_CHARACTER_ID,
  initiate: handleInitiate,
  handle: handleCharacterSelect,
};
