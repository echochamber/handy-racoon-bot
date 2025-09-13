import { Request, Response } from 'express';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser } from '@/util/discordAPI.js';
import magicItemDao from '@/storage/entities/magicItem.js';

export const LIST_ATTUNEMENTS_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'list_attunements',
  description: 'List attunements for a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}
export const SELECT_CHARACTER_ID = 'list_attunements_select_character';




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
            custom_id: SELECT_CHARACTER_ID,
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
  console.log(comp.data);
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

  const character = await characterDao.find(db, selectedCharacterId);
  if (!character) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Character not found.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  const items = await magicItemDao.findByIds(db, character.attunedItemIds)
  const itemString = items.map(i => "* " + i.name).join("\n");

  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `**${character.name}** has attuned...\n${itemString}`,
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  });
}

export const listAttunements = {
  command: LIST_ATTUNEMENTS_COMMAND,
  select_character_id: SELECT_CHARACTER_ID,
  initiate: handleInitiate,
  handle: handleCharacterSelect,
}

function modalResponseMessage(res: Response<any, Record<string, any>>, arg1: string): any {
  throw new Error('Function not implemented.');
}
