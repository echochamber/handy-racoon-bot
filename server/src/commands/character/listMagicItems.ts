import display from '@/commands/display.js';
import { characterDao } from '@/storage/entities/character.js';
import { magicItemDao } from '@/storage/entities/magicItem.js';
import { db } from '@/storage/firebase.js';
import { APIInteraction, APIMessageComponentSelectMenuInteraction, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Request, Response } from 'express';
import { finalInteraction, messageSelectEntity, simpleErrorEphemeral, simpleUpdate } from '../discordMessageUtil.js';

export const LIST_ITEMS_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'items',
  description: 'List all magic items a character owns',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SELECT_CHARACTER = 'list_magic_items_select_character';

export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);
  res.send(messageSelectEntity({
      entities: characters,
      label: "Select Character",
      placeholder: "Character",
      customId: SELECT_CHARACTER,
      isUpdate: false,
      required: true
  }));
}

export async function handleCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    res.send(simpleErrorEphemeral("No character selected.", "Error"));
    return;
  }
  const selectedCharacterId = comp.data.values[0];

  const items = await magicItemDao.findByCharacter(db, selectedCharacterId);

  if (!items || items.length === 0) {
    res.send(simpleUpdate("This character owns no magic items."));
    return;
  }

  // Find the selected character's name
  const selectedCharacter = await characterDao.find(db, selectedCharacterId);
  const characterName = selectedCharacter ? selectedCharacter.name : "Unknown Character";
  const msg = `# ${characterName}: Owned Magic items\n${items.map(display.item).join('\n')}`
  finalInteraction(res, interaction, msg, true);
}

export const listMagicItems = {
  command: LIST_ITEMS_COMMAND,
  select_character_id: SELECT_CHARACTER,
  initiate: handleInitiate,
  handleCharacterSelect: handleCharacterSelect,
};
