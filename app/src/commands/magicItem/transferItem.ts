import { characterDao } from '@/storage/entities/character.js';
import { MagicItem, magicItemDao } from '@/storage/entities/magicItem.js';
import { db } from '@/storage/firebase.js';
import { messageSelectEntity, simpleErrorEphemeral, simpleUpdate } from '@/commands/discordMessageUtil.js';
import {
  APIInteraction,
  APIMessageComponentSelectMenuInteraction,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ComponentType,
  InteractionContextType,
  InteractionResponseType,
  RESTPostAPIApplicationCommandsJSONBody
} from 'discord-api-types/v10';
import { InteractionResponseFlags } from 'discord-interactions';
import { Request, Response } from 'express';

export const TRANSFER_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'transfer_item',
  description: 'Transfer a magic item from one character to another',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_FROM_CHARACTER = 'transfer_item_select_from_character';
export const SELECT_ITEM = 'transfer_item_select_item';
export const SELECT_TO_CHARACTER = 'transfer_item_select_to_character';

const messageFields = {
  FROM_CHARACTER_ID: 'from_character_id',
  ITEM_ID: 'item_id',
  TO_CHARACTER_ID: 'to_character_id',
}

// Step 1: Select "from" character
export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);

  res.send(messageSelectEntity({
    entities: characters,
    label: '# Select Character to Transfer From',
    placeholder: 'From Character',
    customId: SELECT_FROM_CHARACTER,
    defaultId: undefined,
    isUpdate: false,
    required: true
  }));
}

// Step 2: Select item from "from" character
export async function handleFromCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send(simpleErrorEphemeral("No character selected."));
  }
  const fromCharacterId = comp.data.values[0];

  const items = await magicItemDao.findByCharacter(db, fromCharacterId);

  if (items.length === 0) {
    return res.send(simpleErrorEphemeral("This character has no magic items."));
  }

  // Store fromCharacterId in custom_id for next step
  res.send(messageSelectEntity({
    entities: items,
    label: '# Select Magic Item to Transfer',
    placeholder: 'Magic Item',
    customId: `${SELECT_ITEM}:${fromCharacterId}`,
    defaultId: undefined,
    isUpdate: true,
    required: true
  }));
}

// Step 3: Select "to" character
export async function handleItemSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send(simpleErrorEphemeral("No item selected."));
  }
  // Extract fromCharacterId from custom_id
  const [_, fromCharacterId] = comp.data.custom_id.split(':');
  const selectedItemId = comp.data.values[0];

  const characters = await characterDao.all(db);
  // Exclude the "from" character from the options
  const characterOptions = characters
    .filter(c => c.meta?.id !== fromCharacterId)
    .map(c => ({
      label: c.name,
      value: c.meta?.id,
    }));

  if (characterOptions.length === 0) {
    res.send(simpleErrorEphemeral("No other characters available to transfer to."));
    return
  }

  // Store fromCharacterId and itemId in custom_id for next step
  res.send(messageSelectEntity({
    entities: characters,
    label: '# Select Character to Transfer To',
    placeholder: "To Character",
    customId: `${SELECT_TO_CHARACTER}:${fromCharacterId}:${selectedItemId}`,
    defaultId: undefined,
    isUpdate: true,
    required: true
  }));
}

// Step 4: Perform the transfer
export async function handleToCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.custom_id) {
    return res.send(simpleErrorEphemeral("No character selected."));
  }
  // Extract fromCharacterId and itemId from custom_id
  const [_, fromCharacterId, itemId] = comp.data.custom_id.split(':');
  const toCharacterId = comp.data.values[0];

  // Validate characters and item
  const [fromCharacter, toCharacter, item] = await Promise.all([
    characterDao.find(db, fromCharacterId),
    characterDao.find(db, toCharacterId),
    magicItemDao.find(db, itemId),
  ]);

  if (!fromCharacter || !toCharacter || !item) {
    res.send(simpleErrorEphemeral("Invalid character or item."));
    return;
  }

  // Remove item from fromCharacter, add to toCharacter
  item.ownerId = toCharacterId;
  item.isAttuned = false; // Remove attunement on transfer

  // Remove from attunedItemIds if present
  if (fromCharacter.attunedItemIds) {
    fromCharacter.attunedItemIds = fromCharacter.attunedItemIds.filter(id => id !== itemId);
  }
  characterDao.transferItem(db, fromCharacterId, toCharacterId, itemId);

  res.send(simpleUpdate(`Transferred "${item.name}" from ${fromCharacter.name} to ${toCharacter.name}.`));
}

export const transferItem = {
  command: TRANSFER_ITEM_COMMAND,
  select_from_character_id: SELECT_FROM_CHARACTER,
  select_item_id: SELECT_ITEM,
  select_to_character_id: SELECT_TO_CHARACTER,
  initiate: handleInitiate,
  fromCharacterSelect: handleFromCharacterSelect,
  itemSelect: handleItemSelect,
  toCharacterSelect: handleToCharacterSelect,
}
