import { characterDao } from '@/storage/entities/character.js';
import { MagicItem, magicItemDao } from '@/storage/entities/magicItem.js';
import { db } from '@/storage/firebase.js';
import { messageSelectEntity, simpleErrorEphemeral, simpleUpdateEphemeral } from '@/util/discordMessageUtil.js';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { InteractionResponseFlags } from 'discord-interactions';
import { Request, Response } from 'express';

export const ATTUNE_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'attune_item',
  description: 'Add a magic item to a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_CHARACTER = 'attune_item_select_character';
export const SELECT_ITEM = 'attune_item_select_item';

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
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    console.log(comp);
    res.send(simpleErrorEphemeral("Interaction missing data."));
    console.error(`Interaction missing data ${JSON.stringify(comp.data)}`);
  }
  const selectedCharacterId = comp.data.values[0];

  if (!selectedCharacterId) {
      res.send(simpleErrorEphemeral("No character selected."));
      return;
  }

  const items = await magicItemDao.findByCharacter(db, selectedCharacterId);

  if (items.length === 0) {
    res.send(simpleErrorEphemeral("This character has no unattuned magic items."));
    return;
  }

  res.send(messageSelectEntity({
    entities: items,
    label: '# Select Magic Item',
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
  console.log(comp.data);
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    return res.send(simpleErrorEphemeral("No item selected."));
  }
  const selectedItemId = comp.data.values[0];

  const item = await magicItemDao.find(db, selectedItemId);
  if (!item) {
    res.send(simpleErrorEphemeral("Item not found."))
    return;
  }

  const characterId = item.ownerId;
  if (!characterId) {
    res.send(simpleErrorEphemeral("Item does not have an owner."));
    return
  }

  const character = await characterDao.find(db, characterId);
  if (!character) {
    res.send(simpleErrorEphemeral('Character not found.'));
    return;
  }

  const attunedItemIds = character.attunedItemIds ?? [];
  if (attunedItemIds.length >= 3) {
    res.send(simpleErrorEphemeral('This character already has 3 attuned items.'));
    return
  }

  if (!attunedItemIds.includes(selectedItemId)) {
    item.isAttuned = true;
    await Promise.all([
      characterDao.attuneItem(db, item.ownerId!, selectedItemId),
      magicItemDao.update(db, item),
    ]);
  }

  res.send(simpleUpdateEphemeral(`${character.name} now has attuned "${item.name}".`));
}

export const attuneItem = {
  command: ATTUNE_ITEM_COMMAND,
  select_character_id: SELECT_CHARACTER,
  select_item_id: SELECT_ITEM,
  initiate: handleInitiate,
  characterSelect: handleCharacterSelect,
  itemSelect: handleItemSelect,
}