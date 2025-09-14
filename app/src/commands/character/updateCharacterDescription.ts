import { Request, Response } from 'express';
import {
  APIInteraction,
  APIModalSubmitInteraction,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ComponentType,
  InteractionContextType,
  InteractionResponseType,
  RESTPostAPIApplicationCommandsJSONBody,
  SelectMenuDefaultValueType,
  TextInputStyle,
} from 'discord-api-types/v10';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { modalResponseMessage } from '@/commands/discordMessageUtil.js';

export const UPDATE_CHARACTER_DESCRIPTION_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'update_character_description',
  description: 'Update the description of an existing RPG character',
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

export const UPDATE_DESCRIPTION_CUSTOM_ID = 'update_character_description_modal_submit';

export async function handleInitiate(req: Request, res: Response) {

  // Fetch characters for this user
  const characters = await characterDao.all(db);

  if (!characters || characters.length === 0) {
    console.error(`You don't have any characters to update.`);
    return res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `You don't have any characters to update.`,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  const characterOptions = characters.map((c: Character) => ({
    label: c.name,
    value: c.meta?.id ?? "", // Use character id as value
  }));

  res.send({
    type: InteractionResponseType.Modal,
    data: {
      custom_id: UPDATE_DESCRIPTION_CUSTOM_ID,
      title: 'Update Character Description',
      components: [
        {
          type: ComponentType.Label,
          label: 'Character',
          component: {
            type: ComponentType.StringSelect,
            custom_id: 'character_select',
            min_values: 1,
            max_values: 1,
            options: characterOptions,
            placeholder: "Character",
            required: true

          }
        },
        {
          type: ComponentType.Label,
          label: 'New Description',
          component: {
            type: ComponentType.TextInput,
            custom_id: 'character_description',
            style: TextInputStyle.Paragraph,
            required: true,
            max_length: 200,
          },
        },
      ],
    },
  });
}

export async function handleModalSubmission(req: Request, res: Response) {
  const interaction = req.body as APIModalSubmitInteraction;

  const fields = (interaction.data.components ?? []).map((c: any) =>
    'component' in c ? c.component : c
  );

  const characterId = fields.find(
    (c: any) =>
      c.custom_id === 'character_select' &&
      (c.type === ComponentType.StringSelect)
  )?.values?.[0];

  const newDescription =
    fields.find(
      (c: any) =>
        c.custom_id === 'character_description' &&
        c.type === ComponentType.TextInput
    )?.value?.trim() ?? '';

  if (!characterId) {
    return modalResponseMessage(
      res,
      'No character selected. Please try again.'
    );
  }

  // Find character by id
  const character = await characterDao.find(db, characterId);
  if (!character) {
    return modalResponseMessage(
      res,
      `Character not found.`
    );
  }

  // Update description
  try {
    await characterDao.update(db, characterId, {description: newDescription});
    modalResponseMessage(
      res,
      `Description for "${character.name}" updated successfully.`
    );
  } catch (e) {
    modalResponseMessage(
      res,
      `Failed to update description for "${character.name}".`
    );
  }
}

export const updateCharacterDescription = {
  command: UPDATE_CHARACTER_DESCRIPTION_COMMAND,
  submit_id: UPDATE_DESCRIPTION_CUSTOM_ID,
  initiate: handleInitiate,
  submit: handleModalSubmission,
};