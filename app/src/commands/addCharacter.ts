import { Request, Response } from 'express';
import { APIInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser } from '@/util/discordAPI.js';

export const ADD_CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'add_character',
  description: 'Add a RPG character to the app',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SUBMIT_CUSTOM_ID = 'add_character';



export function handleInitiate(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const invokerId =
    (interaction.member?.user?.id ?? interaction.user?.id) as string;

  res.send({
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

  const userId = fields.find((c: any) => c.custom_id === 'player' && c.type === ComponentType.UserSelect)?.values?.[0];
  const characterName = fields.find((c: any) =>
    c.custom_id === 'character_name'
    && c.type === ComponentType.TextInput)?.value?.trim();
  const characterDesc = fields.find((c: any) =>
    c.custom_id === 'character_description'
    && c.type === ComponentType.TextInput)?.value?.trim();

  var character: Character = {
    name: String(characterName),
    description: characterDesc,
    attunedItemIds: []
  }
  characterDao.create(db, userId, character, true)
    .then(i => modalResponseMessage(res, `Character ${characterName} created.`))
    .catch(i => {
      modalResponseMessage(res, `Failed to create ${characterName}.`)
      throw i;
    });
}

export function processUser(userId: Number) {
  const userResult = lookupUser(userId);
  userResult.then(async d => {
    const data = await d.json();
    console.log(`Hello ${JSON.stringify(data)}`)
  })
}

export const addCharacter = {
  command: ADD_CHARACTER_COMMAND,
  submit_id: SUBMIT_CUSTOM_ID,
  initiate: handleInitiate,
  submit: handleModalSubmission,
}

function modalResponseMessage(res: Response<any, Record<string, any>>, arg1: string): any {
  throw new Error('Function not implemented.');
}
