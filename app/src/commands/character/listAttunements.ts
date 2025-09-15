import { Request, Response } from 'express';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser } from '@/discord/discordAPI.js';
import { magicItemDao } from '@/storage/entities/magicItem.js';
import { deleteEphemMessage, messageSelectEntity, simpleMessage, simpleUpdate } from '../discordMessageUtil.js';

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
  res.send(messageSelectEntity(
    {
      entities: characters,
      label: 'Select Character',
      placeholder: 'Character',
      customId: SELECT_CHARACTER_ID,
      defaultId: undefined,
      isUpdate: false,
      required: true
    }));
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

  deleteEphemMessage(interaction);
  res.send(simpleMessage(`**${character.name}** has attuned...\n${itemString}`, false));
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
