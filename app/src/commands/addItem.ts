import { Request, Response } from 'express';
import { APIInteraction, APIModalSubmitInteraction, ApplicationCommandType, ApplicationIntegrationType, ComponentType, InteractionContextType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { playerDao } from '@/storage/entities/player.js';
import { db } from '@/storage/firebase.js';
import { Character, characterDao } from '@/storage/entities/character.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { lookupUser, modalSuccessMessage as modalResponseMessage } from '@/util/discordAPI.js';
import magicItemDao, { MagicItem } from '@/storage/entities/magicItem.js';

export const ADD_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'add_magic_item',
  description: 'Add a magic item to a character',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export const SUBMIT_CUSTOM_ID = 'add_magic_item';
const modalFields = {
  OWNER_ID: 'owner_id',
  ITEM_NAME: 'item_name',
  ITEM_DESCRIPTION: 'item_description',
  IS_ATTUNED: 'is_attuned',
}


export async function handleInitiate(req: Request, res: Response) {
  const characters = await characterDao.all(db);
  const characterOptions = [
    { label: "Stash", value: "stash", default: true},
    ...characters.map(c => ({
      label: c.name,
      value: c.meta?.id,
    })),
  ];
  return res.send({
    type: InteractionResponseType.Modal,
    data: {
      custom_id: SUBMIT_CUSTOM_ID,
      title: 'Add Magic Item',
      components: [
        {
          type: ComponentType.Label,
          label: 'Owner (Blank for Stash)',
          component: {
            type: ComponentType.StringSelect,
            custom_id: modalFields.OWNER_ID,
            min_values: 1,
            max_values: 1,
            options: characterOptions,
            placeholder: "Character",
            required: false
          }
        },
        {
          type: ComponentType.Label,
          label: 'Item Name',
          component: {
            type: ComponentType.TextInput,
            custom_id: modalFields.ITEM_NAME,
            style: TextInputStyle.Short,
            required: true,
            max_length: 80,
          },
        },
        {
          type: ComponentType.Label,
          label: 'Item Description',
          component: {
            type: ComponentType.TextInput,
            custom_id: modalFields.ITEM_DESCRIPTION,
            style: TextInputStyle.Paragraph,
            required: false,
            max_length: 600,
          },
        },
        {
          type: ComponentType.Label,
          label: 'Is Attuned?',
          component: {
            type: ComponentType.StringSelect,
            custom_id: modalFields.IS_ATTUNED,
            min_values: 1,
            max_values: 1,
            options: [
              {
                "label": "Yes",
                "value": true,

              },
              {
                "label": "No",
                "value": "0",
                "default": false,
              },
            ]
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

  const name = fields.find((c: any) => c.custom_id === modalFields.ITEM_NAME && c.type === ComponentType.TextInput)?.value?.trim() as string;
  const desc = fields.find((c: any) => c.custom_id === modalFields.ITEM_DESCRIPTION && c.type === ComponentType.TextInput)?.value?.trim() as string;
  const ownerId = fields.find((c: any) => c.custom_id === modalFields.OWNER_ID && c.type === ComponentType.StringSelect)?.values?.[0] as string;
  const isAttuned = Boolean(Number(fields.find((c: any) => c.custom_id === modalFields.IS_ATTUNED && c.type === ComponentType.StringSelect)?.values?.[0]))
  console.log(fields);
  console.log(isAttuned);

  var item: MagicItem = {
    name: name,
    description: desc,
    isAttuned: isAttuned,
    ownerId: ownerId == "stash" ? undefined : ownerId
  }
  magicItemDao.create(db, item, true)
    .then(i => modalResponseMessage(res, `Item ${name} created.`))
    .catch(i => {
      modalResponseMessage(res, `Failed to create item ${name}.`)
      throw i;
    });


}

export const addItem = {
  command: ADD_ITEM_COMMAND,
  submit_id: SUBMIT_CUSTOM_ID,
  initiate: handleInitiate,
  submit: handleModalSubmission,
}