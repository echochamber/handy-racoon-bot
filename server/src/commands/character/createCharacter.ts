import { Request, Response } from 'express';
import { APIInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser } from '@/discord/discordAPI.js';
import { simpleErrorEphemeral, simpleMessage } from '../discordMessageUtil.js';

export const CREATE_CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'create',
  description: 'Create a new RPG character.',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SUBMIT_CUSTOM_ID = 'add_character_modal_submit';



export function handleInitiate(req: Request, res: Response) {
  const interaction = req.body as APIInteraction;
  const invokerId =
    (interaction.member?.user?.id ?? interaction.user?.id) as string;

  res.send({
    type: InteractionResponseType.Modal,
    data: {
      custom_id: SUBMIT_CUSTOM_ID,
      title: 'Create Character',
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
            max_length: 250,
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
    && c.type === ComponentType.TextInput)?.value?.trim() ?? '';

    // Check if character with the same name already exists for this user
    const existing = await characterDao.findByName(db, characterName);
    console.log(existing);
    if (existing.length) {
      simpleErrorEphemeral(`Character creation failed: a character named "${characterName}" already exists.`)
      return;
    }

  var character: Character = {
    name: String(characterName),
    description: characterDesc,
    attunedItemIds: []
  }
  characterDao.create(db, character, userId, true)
    .then(i => res.send(simpleMessage(`Character **${characterName}** created.`)))
    .catch(i => {
      res.send(simpleErrorEphemeral(`Failed to create ${characterName}.`))
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
  command: CREATE_CHARACTER_COMMAND,
  submit_id: SUBMIT_CUSTOM_ID,
  initiate: handleInitiate,
  submit: handleModalSubmission,
}
