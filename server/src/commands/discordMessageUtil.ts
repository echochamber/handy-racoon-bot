import { config } from "@/config.js";
import { executeDiscordRequest } from "@/discord/discordAPI.js";
import { Character } from "@/storage/entities/character.js";
import { FirebaseEntity } from "@/storage/entities/docBase.js";
import { MagicItem } from "@/storage/entities/magicItem.js";
import { APIBaseMessageNoChannel, APIEmbed, APIInteraction, APIInteractionResponseChannelMessageWithSource, APIInteractionResponseUpdateMessage, APIModalComponent, ComponentType, EmbedType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { Response } from "express";


/**
 * Most final interactions involve deleting the ephemeral message the user has
 * been interacting with, and then displaying requested information.
 * @param res
 * @param interaction
 * @param message
 * @param isEphemeral
 */
export async function finalInteraction(res: Response, interaction: APIInteraction, message: string, isEphemeral: boolean = true) {
  if (isEphemeral) {
    res.send(simpleUpdate(message, isEphemeral));
  } else {
    res.send(simpleMessage(message, isEphemeral));
    deleteEphemMessage(interaction);
  }
}

/**
 * Delete an ephemeral message from an existing interaction.
 * @param interaction
 * @returns
 */
export async function deleteEphemMessage(interaction: APIInteraction) {
  const endpoint = `webhooks/${config.APPLICATION_ID}/${interaction.token}/messages/${interaction.message?.id}`;
  // This function only builds the endpoint string.
  // To actually delete the message, you would need to perform a DELETE request to this endpoint.
  return await executeDiscordRequest(endpoint, { method: "DELETE" });
}

/**
 * Same as simple message, but with error formatting.
 * @param message
 * @param title
 * @returns
 */
export function simpleErrorEphemeral(message: String, title: string = "Issue") {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral,
      content: title,
      embeds: [{
        title: title,
        color: 0xFF0033,
        description: message
      }],
    },
  }
}

/**
 * Update an existing message with the simple content.
 * @param message
 * @param isEphemeral
 * @returns
 */
export function simpleUpdate(message: string, isEphemeral: boolean = true): APIInteractionResponseUpdateMessage {
  return {
    type: InteractionResponseType.UpdateMessage,
    data: {
      flags: isEphemeral ? MessageFlags.Ephemeral : undefined,
      content: message,
      components: [],
    },
  }
}

/** A simple message with the given content */
export function simpleMessage(
  message: string,
  isEphemeral: boolean = true
): APIInteractionResponseChannelMessageWithSource {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: isEphemeral ? MessageFlags.Ephemeral : undefined,
      content: message,
      components: [],
    },
  }
}

export function modalBooleanSelect(label: string, customId: string, trueLabel: string | undefined = "Yes", falseLabel: string | undefined = "No", defaultTrue: boolean | undefined = true): APIModalComponent {
  return {
    type: ComponentType.Label,
    label: label,
    component: {
      type: ComponentType.StringSelect,
      custom_id: customId,
      min_values: 1,
      max_values: 1,
      options: [
        {
          "label": trueLabel,
          "value": "True",
          "default": defaultTrue,
        },
        {
          "label": falseLabel,
          "value": "False",
          "default": !defaultTrue,
        },
      ]
    },
  }
}
export interface SelectEntityArgs {
  entities: Partial<Character | MagicItem>[],
  label: string,
  placeholder: string,
  customId: string,
  defaultId?: string,
  isUpdate?: boolean,
  required?: boolean
};

/** Discord types. */
export type MessageOrUpdate = APIInteractionResponseChannelMessageWithSource | APIInteractionResponseUpdateMessage;

/**
 * Form field for selecting one of many "entities" in a form embedded in a discord message.
 * @param args
 * @returns
 */
export function messageSelectEntity(args: SelectEntityArgs): MessageOrUpdate {
  var val: MessageOrUpdate = {
    type: args.isUpdate ? InteractionResponseType.UpdateMessage : InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: MessageFlags.Ephemeral,
      content: args.label,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [{
            type: ComponentType.StringSelect,
            custom_id: args.customId,
            min_values: 1,
            max_values: 1,
            options: entityToOptions(args.entities, true, args.defaultId),
            placeholder: args.placeholder,
            required: args.required
          }]
        },
      ],
    },
  };
  return val;
}

/**
 * Character select form field used in modal components.
 * @param characters
 * @param label
 * @param idAsValue
 * @param defaultCharacterId
 * @returns
 */
export function modalCharacterSelect(
  characters: Partial<Character>[],
  label: string = "Character",
  idAsValue: boolean = true,
  defaultCharacterId: string | undefined = undefined
) {

  return {
    type: ComponentType.Label,
    label: label,
    component: {
      type: ComponentType.StringSelect,
      custom_id: 'character_select',
      min_values: 1,
      max_values: 1,
      options: entityToOptions(characters, idAsValue, defaultCharacterId),
      placeholder: "Character",
      required: true

    }
  }
}

/**
 * Convert a firebase entites to options for selecting it using discord
 * select menu.
 * @param entities
 * @param idAsValue
 * @param defaultId
 * @returns
 */
function entityToOptions<T extends FirebaseEntity>(
  entities: T[],
  idAsValue: boolean = true,
  defaultId: string | undefined = undefined
) {
  return entities
    .map(c => ({
      label: c.name as string,
      value: (idAsValue ? c.meta?.id : c.name) as string,
      default: defaultId !== undefined && defaultId === c.meta?.id,
    }))
    .filter(option => option.label !== undefined && option.value !== undefined);
}

export function embedGif(title: string, url: string): APIEmbed {

  return {
    "title": title,
    "type": EmbedType.Image,
    "image": {
      "url": url
    }
  }
}

/**
 * Writes to the frankbot webhook.
 * @param body
 * @param channel
 * @returns
 */
export async function frankBotWebHook(body: Partial<APIBaseMessageNoChannel>, channel?: number): Promise<globalThis.Response> {
  return executeDiscordRequest(config.FRANK_BOT_WEBHOOK_URL, { method: 'POST', body: body });
}