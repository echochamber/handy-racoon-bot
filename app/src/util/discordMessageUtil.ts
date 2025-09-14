import { Character } from "@/storage/entities/character.js";
import { FirebaseEntity } from "@/storage/entities/docBase.js";
import { MagicItem } from "@/storage/entities/magicItem.js";
import { APIInteractionResponse, APIInteractionResponseChannelMessageWithSource, APIInteractionResponseUpdateMessage, ComponentType, InteractionResponseType, MessageFlags } from "discord-api-types/v10"
import { Response } from "express";



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
  message: string
): any {
  res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: message,
      flags: MessageFlags.Ephemeral,
    },
  });
}

export function simpleUpdateEphemeral(message: string) {
  return {
    type: InteractionResponseType.UpdateMessage,
    data: {
      flags: MessageFlags.Ephemeral,
      content: message,
      compontents: [],
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
      flags: MessageFlags.Ephemeral,
    },
  };
  console.log(val);
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