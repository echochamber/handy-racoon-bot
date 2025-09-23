import {
  InteractionResponseFlags,
} from "discord-interactions";

import { Request, Response } from 'express';


import { ComponentType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { getRandomEmoji } from "../util/misc.js";
import { CommandGroupHandler as CommandGroupHandler } from "@/commands/commands.js";

// Simple test command
export const TEST_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};



export function handleTest(req: Request, res: Response) {
  return res.send({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: ComponentType.TextDisplay,
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      ],
    },
  });
}



export const testCommandExp: CommandGroupHandler = {
  command: TEST_COMMAND,
  initiate: handleTest,
}
