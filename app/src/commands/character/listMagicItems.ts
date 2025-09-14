import { Request, Response } from 'express';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { magicItemDao } from '@/storage/entities/magicItem.js';
import display from '@/util/display.js';

export const LIST_ITEMS_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'list_magic_items',
  description: 'List all magic items a character owns',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_CHARACTER = 'list_magic_items_select_character';

export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);
  const characterOptions = characters.map(c => ({
      label: c.name,
      value: c.meta?.id,
  }));
  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      title: 'Select Character',
      components: [
        {
          type: ComponentType.ActionRow,
          components: [{
            type: ComponentType.StringSelect,
            custom_id: SELECT_CHARACTER,
            min_values: 1,
            max_values: 1,
            options: characterOptions,
            placeholder: "Character",
            required: true
          }]
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
        content: "No character selected.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  const selectedCharacterId = comp.data.values[0];

  const items = await magicItemDao.findByCharacter(db, selectedCharacterId);

  if (!items || items.length === 0) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This character owns no magic items.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const itemList = items.map(item => {
    const attuned = item.isAttuned ? " (attuned)" : "";
    return `• ${item.name}${attuned}`;
  }).join('\n');

  // Find the selected character's name
  const selectedCharacter = await characterDao.find(db, selectedCharacterId);
  const characterName = selectedCharacter ? selectedCharacter.name : "Unknown Character";

  return res.send({
    type: InteractionResponseType.UpdateMessage,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      embeds: [
        {
          title: `${characterName}: Owned Magic items `,
          description: items.map(display.item).join('\n'),
          color: 0x5865F2, // Discord blurple accent
        }
      ],
    },
  });
}

export const listMagicItems = {
  command: LIST_ITEMS_COMMAND,
  select_character_id: SELECT_CHARACTER,
  initiate: handleInitiate,
  handleCharacterSelect: handleCharacterSelect,
};
