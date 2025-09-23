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
import { deleteEphemMessage, messageSelectEntity, simpleErrorEphemeral } from '../discordMessageUtil.js';

export const SHOW_CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'show',
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
    res.send(messageSelectEntity({
        entities: characters,
        label: "Select Character",
        placeholder: "Character",
        customId: SELECT_CHARACTER_ID,
        isUpdate: false,
        required: true
    }));
}

export async function handleCharacterSelect(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIMessageComponentSelectMenuInteraction;
  if (!comp.data || !comp.data.values || !comp.data.values[0]) {
    res.send(simpleErrorEphemeral('No character selected.'));
    return
  }
  const selectedCharacterId = comp.data.values[0];

  const [character, items] = await Promise.all([
    characterDao.find(db, selectedCharacterId),
    magicItemDao.findByCharacter(db, selectedCharacterId)]
  );
  if (!character) {
    res.send(simpleErrorEphemeral('Character not found.'));
    return
  }

  // Customize this string with whatever character details you want to show

  deleteEphemMessage(interaction);
  res.send(display.detailedCharacterMessage(character,items));
  return
}

export const showCharacter = {
  command: SHOW_CHARACTER_COMMAND,
  select_character_id: SELECT_CHARACTER_ID,
  initiate: handleInitiate,
  handle: handleCharacterSelect,
};
