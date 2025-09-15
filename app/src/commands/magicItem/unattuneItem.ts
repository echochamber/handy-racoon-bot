import { characterDao } from '@/storage/entities/character.js';
import { MagicItem, magicItemDao } from '@/storage/entities/magicItem.js';
import { db } from '@/storage/firebase.js';
import { deleteEphemMessage, finalInteraction as completeInteraction, messageSelectEntity, simpleErrorEphemeral, simpleMessage, simpleUpdate } from '@/commands/discordMessageUtil.js';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Request, Response } from 'express';

export const UNATTUNE_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'unattune_item',
  description: 'Remove an attuned magic item from a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_CHARACTER = 'unattune_item_select_character';
export const SELECT_ITEM = 'unattune_item_select_item';

export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);
  res.send(messageSelectEntity(
    {
      entities: characters,
      label: 'Select Character',
      placeholder: 'Character',
      customId: SELECT_CHARACTER,
      defaultId: undefined,
      isUpdate: false,
      required: true
    }));
}

export async function handleCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    console.log(comp);
    return res.send(simpleErrorEphemeral(`Interaction missing data ${JSON.stringify(comp.data)}`));
  }
  const selectedCharacterId = comp.data.values[0];

  if (!selectedCharacterId) {
    return res.send(simpleErrorEphemeral("No character selected."));
  }

  const items = (await magicItemDao.findByCharacter(db, selectedCharacterId))
      .filter(item => item.isAttuned);

  if (items.length === 0) {
    return res.send(simpleErrorEphemeral("This character has no attuned magic items."));
  }

  res.send(messageSelectEntity({
    entities: items,
    label: "Select Magic Item to Unattune",
    placeholder: "Magic Item",
    customId: SELECT_ITEM,
    defaultId: undefined,
    isUpdate: true,
    required: true
  }));
}

export async function handleItemSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send(simpleErrorEphemeral("Bad request from discord."));
  }
  const selectedItemId = comp.data.values[0];

  const item = await magicItemDao.find(db, selectedItemId);
  if (!item) {
    return res.send(simpleErrorEphemeral("Item not found."));
  }

  const characterId = item.ownerId;
  if (!characterId) {
    return res.send(simpleErrorEphemeral("Item does not have an owner."));
  }

  const character = await characterDao.find(db, characterId);
  if (!character) {
    return res.send(simpleErrorEphemeral("Character not found."));
  }

  const attunedItemIds = character.attunedItemIds ?? [];
  if (!attunedItemIds.includes(selectedItemId)) {
    return res.send(simpleErrorEphemeral("This item is not attuned to the character."));
  }

  // Remove the item from attunedItemIds and update both character and item
  await Promise.all([
    characterDao.unattuneItem(db, item.ownerId!, selectedItemId),
    magicItemDao.update(db, { ...item, isAttuned: false }),
  ]);

  completeInteraction(res, interaction, `**${character.name}** has unattuned **${item.name}**.`, false);
}

export const unattuneItem = {
  command: UNATTUNE_ITEM_COMMAND,
  select_character_id: SELECT_CHARACTER,
  select_item_id: SELECT_ITEM,
  initiate: handleInitiate,
  handleCharacterSelect: handleCharacterSelect,
  handleItemSelect: handleItemSelect,
}
