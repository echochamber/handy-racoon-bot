import { Request, Response } from 'express';
import { APIInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { playerDao } from '@/storage/entities/player.js';
import { db } from '@/storage/firebase.js';
import { Character } from '@/storage/entities/character.js';
import { lookupUser } from '@/utils.js';

export const ADD_CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody  = {
  name: 'add_character',
  description: 'Add a RPG character to the app',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}



export function handleInitiate(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const invokerId =
    (interaction.member?.user?.id ?? interaction.user?.id) as string;

  return res.send({
    type: InteractionResponseType.Modal,
    data: {
      custom_id: 'add_character',
      title: 'Add Character',
      components: [
        {
          type: ComponentType.Label,
          label: 'Person Playing Character',
          component: {
            type: ComponentType.UserSelect,
            custom_id: 'player',
            min_values: 1,
            max_values: 1,
            default_values: [{ id: invokerId, type: SelectMenuDefaultValueType.User }],
          },
        },
        {
          type: ComponentType.Label,
          label: 'Character Name',
          component: {
            type: ComponentType.TextInput,
            custom_id: 'character_name',
            style: TextInputStyle.Short,
            required: true,
            max_length: 50,
          },
        },
        {
          type: ComponentType.Label,
          label: 'Character Description (Optional)',
          component: {
            type: ComponentType.TextInput,
            custom_id: 'character_description',
            style: TextInputStyle.Paragraph,
            required: false,
            max_length: 50,
          },
        },
      ],
    },
  });
}

export async function handleModalSubmission(req: Request, res: Response) {
  const interaction = req.body as APIModalSubmitInteraction;

  const fields = (interaction.data.components ?? [])
      .map((c: any) => ('component' in c ? c.component : c));

  const userComp = fields.find((c: any) => c.custom_id === 'player' && c.type === ComponentType.UserSelect);
  const nameComp = fields.find((c: any) => c.custom_id === 'character_name' && c.type === ComponentType.TextInput);
  const descComp = fields.find((c: any) => c.custom_id === 'character_description' && c.type === ComponentType.TextInput);

  const userId = userComp?.values?.[0];
  const characterName = nameComp?.value?.trim();
  const characterDesc = descComp?.value?.trim();
  const userResult = lookupUser(userId);
  userResult.then(async d => {
    const data = await d.json();
    // user.global_name
    // user.username
    console.log(`Hello ${JSON.stringify(data)}`)
  })
  console.log(`Useful ${userId} ${characterName} ${characterDesc}`);
  var character: Character = {
    name: String(characterName),
    description: characterDesc,
    attunedItemIds: []
  }
  playerDao.addCharacter(db, userId, character);
}

export const addCharacter = {
  handleInitiate,
  handleModalSubmission,
  nameHandleMap: {
    "add_character": handleInitiate,
    "add_character_submit": handleModalSubmission,
  }
}