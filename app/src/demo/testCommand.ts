import {
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";

import { Request, Response } from 'express';


import { getRandomEmoji } from "../utils.js";
import { APIInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

// Simple test command
export const TEST_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};



export function handleTest(interaction: APIInteraction, res: Response) {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      ],
    },
  });
}
