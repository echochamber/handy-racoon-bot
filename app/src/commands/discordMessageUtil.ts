import { config } from "@/config.js";
import { executeDiscordRequest } from "@/discord/discordAPI.js";
import { Character } from "@/storage/entities/character.js";
import { FirebaseEntity } from "@/storage/entities/docBase.js";
import { MagicItem } from "@/storage/entities/magicItem.js";
import { APIBaseMessageNoChannel, APIEmbed, APIInteraction, ComponentType, EmbedType, ImageSize, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { Response } from "express";
import { E } from "node_modules/@faker-js/faker/dist/airline-CHFQMWko.js";


export async function finalInteraction(res: Response, interaction: APIInteraction, message: string, isEphemeral: boolean = true) {
  if (isEphemeral) {
    res.send(simpleUpdate(message, isEphemeral));
  } else {
    deleteEphemMessage(interaction);
    res.send(simpleMessage(`message`, isEphemeral));
  }
}

export async function deleteEphemMessage(interaction: APIInteraction) {
  const endpoint = `webhooks/${config.APPLICATION_ID}/${interaction.token}/messages/${interaction.message?.id}`;
  // This function only builds the endpoint string.
  // To actually delete the message, you would need to perform a DELETE request to this endpoint.
  return await executeDiscordRequest(endpoint, { method: "DELETE" });
}
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

export function modalResponseMessage(
  res: Response,
  message: string,
  isEphemeral: boolean = true
): any {
  res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: message,
      flags: isEphemeral ? MessageFlags.Ephemeral : 0,
    },
  });
}

export function simpleUpdate(message: string, isEphemeral: boolean = true) {
  return {
    type: InteractionResponseType.UpdateMessage,
    data: {
      flags: isEphemeral ? MessageFlags.Ephemeral : 0,
      content: message,
      components: [],
    },
  }
}

export function simpleMessage(message: string, isEphemeral: boolean = true) {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: isEphemeral ? MessageFlags.Ephemeral : 0,
      content: message,
    },
  }
}
export interface SelectEntityArgs {
  entities: Partial<Character|MagicItem>[],
  label: string,
  placeholder: string,
  customId: string,
  defaultId?: string,
  isUpdate?: boolean,
  required?: boolean
};
// APIInteractionResponseChannelMessageWithSource | APIInteractionResponseUpdateMessage
export function messageSelectEntity(args: SelectEntityArgs)  {
  const val = {
    type: args.isUpdate ? InteractionResponseType.UpdateMessage: InteractionResponseType.ChannelMessageWithSource,
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
  // TODO Fix type error.
  return val;
}

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

export async function frankBotWebHook(body: Partial<APIBaseMessageNoChannel>): Promise<globalThis.Response> {

  const endpoint = `https://discord.com/api/webhooks/${config.FRANK_BOT_WEBHOOK_CHANNEL}/${config.FRANK_BOT_WEBHOOK_TOKEN}`
  return executeDiscordRequest(endpoint, { method: 'POST', body: body });
}