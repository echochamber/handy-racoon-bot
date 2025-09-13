import { Request, Response } from 'express';
import { APIChatInputApplicationCommandInteraction, APIInteraction, APIMessageComponentSelectMenuInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { playerDao } from '@/storage/entities/player.js';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser, modalSuccessMessage as modalResponseMessage } from '@/util/discordAPI.js';
import magicItemDao, { MagicItem } from '@/storage/entities/magicItem.js';

export const ATTUNE_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'attune_item',
  description: 'Add a magic item to a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_CHARACTER = 'select_character';
export const SELECT_ITEM = 'select_item';

const messageFields = {
  CHARACTER_ID: 'character_id',
  
}


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
  //magicItemDao exists and has 
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    console.log(comp);
    throw new Error(`Interaction missing data ${JSON.stringify(comp.data)}`);
  }
  const selectedCharacterId = comp.data.values[0];

  if (!selectedCharacterId) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "No character selected.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const items = await magicItemDao.findByCharacter(db, selectedCharacterId);

  const itemOptions = items
  .filter(i => !i.isAttuned)
  .map((item: MagicItem) => ({
    label: item.name,
    value: item.meta?.id,
  }));

  if (itemOptions.length === 0) {
    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This character has no unattuned magic items.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
    return;
  }

  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      title: 'Select Magic Item',
      components: [
        {
          type: ComponentType.ActionRow,
          components: [{
            type: ComponentType.StringSelect,
            custom_id: SELECT_ITEM,
            min_values: 1,
            max_values: 1,
            options: itemOptions,
            placeholder: "Magic Item",
            required: true
          }]
        },
      ],
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  });
}

export async function handleItemSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  console.log(comp.data);
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "No item selected.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  const selectedItemId = comp.data.values[0];

  const item = await magicItemDao.find(db, selectedItemId);
  if (!item) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Item not found.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const characterId = item.ownerId;
  if (!characterId) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Item does not have an owner.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const character = await characterDao.find(db, characterId);
  if (!character) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Character not found.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const attunedItemIds = character.attunedItemIds ?? [];
  if (attunedItemIds.length >= 3) {
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This character already has 3 attuned items.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  if (!attunedItemIds.includes(selectedItemId)) {
    await characterDao.addAttunedItem(db, item.ownerId!, selectedItemId);
    item.isAttuned = true;
    await Promise.all([
      magicItemDao.update(db, item),
      characterDao.addAttunedItem(db, item.ownerId!, selectedItemId)
    ]);
  }

  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `${character.name} now has attuned "${item.name}".`,
      flags: InteractionResponseFlags.EPHEMERAL,
    },
  });
}

export const attuneItem = {
  command: ATTUNE_ITEM_COMMAND,
  select_character_id: SELECT_CHARACTER,
  select_item_id: SELECT_ITEM,
  initiate: handleInitiate,
  characterSelect: handleCharacterSelect,
  itemSelect: handleItemSelect,
}