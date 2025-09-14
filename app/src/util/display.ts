import { Character } from "@/storage/entities/character.js";
import { MagicItem } from "@/storage/entities/magicItem.js";
import { InteractionResponseType } from "discord-api-types/v10";
import { InteractionResponseFlags } from "discord-interactions";

export function item(item: MagicItem) {
  const attuned = item.isAttuned ? "🟢" : "⚪";
  return `* ${attuned} **${item.name}**`;
}

export function detailedCharacterMessage(character: Partial<Character>, items: MagicItem[]) {
  const parts = [
    `*${character.description}*`,
    `**Items:**\n ${items.map(item).join('\n')}`
  ]
  const res = {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        // flags: InteractionResponseFlags.EPHEMERAL,
        embeds: [
          {
            title: `${character.name}`,
            description: parts.join("\n\n"),
            color: 0x5865F2, // Discord blurple accent
          }
        ],
      },
    };
    console.log(res);
    console.log(res.data.embeds[0]);
    return res;
}

export default {
  item,
  detailedCharacterMessage
}