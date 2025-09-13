import { getShuffledOptions, getResult, ActiveGame, getRPSChoices, rpsChoice } from "../demo/game.js";
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";

import { Request, Response } from 'express';

import { config } from "../config.js";
import { APIChatInputApplicationCommandInteraction, APIInteraction, APIMessageComponentInteraction, APIMessageComponentSelectMenuInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { capitalize, getRandomEmoji } from "@/util/misc.js";
import { DiscordRequest } from "@/util/discordAPI.js";


const activeGames: { [key: string]: ActiveGame } = {};

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

export const CHALLENGE_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

export function handleInitiateChallenge(req: Request , res: Response) {
  const interaction = req.body as APIInteraction;
  const comp = interaction as APIChatInputApplicationCommandInteraction;
  const userId = (interaction.member?.user?.id ?? interaction.user?.id) as string;
  if (!comp.data || !comp.data.options || !comp.data.options[0]) {
    throw new Error(`Interaction missing data ${JSON.stringify(comp.data)}`);
  }
  const objectName = (comp.data.options[0] as { value: string }).value as keyof rpsChoice;

  // Create active game using message ID as the game ID
  activeGames[interaction.id] = {
    id: userId,
    objectName,
  };

  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          // Fetches a random emoji to send from a helper function
          content: `Rock papers scissors challenge from <@${userId}>`,
        },
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              // Append the game ID to use later on
              custom_id: `accept_button_${req.body.id}`,
              label: "Accept",
              style: ButtonStyleTypes.PRIMARY,
            },
          ],
        },
      ],
    },
  });
}

export async function handleAcceptChallege(req: Request, res: Response, componentId: string) {
  const interaction = req.body as APIInteraction;
  if (!interaction.message) {
    throw new Error("No message in interaction");
  }
  
  // get the associated game ID
  const gameId = componentId.replace("accept_button_", "");
  // Delete message with token in request body
  const endpoint = `webhooks/${config.applicationId}/${interaction.token}/messages/${interaction.message.id}`;
  try {
    const bdy = {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        // Indicates it'll be an ephemeral message
        flags:
          InteractionResponseFlags.EPHEMERAL |
          InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: "What is your object of choice?",
          },
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.STRING_SELECT,
                // Append game ID
                custom_id: `select_choice_${gameId}`,
                options: getShuffledOptions(),
              },
            ],
          },
        ],
      },
    };
    console.log(`Body will be`)
    console.log(bdy)
    res.send(bdy);
    // Delete previous message
    await DiscordRequest(endpoint, { method: "DELETE" });
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

export async function handleSelectChoice(req: Request, res: Response, componentId: string) {
  const interaction = req.body as APIInteraction;
  // get the associated game ID
  const gameId = componentId.replace("select_choice_", "");
  const comp = interaction as APIMessageComponentSelectMenuInteraction; 

  if (!activeGames[gameId]) {
    return;
  }

  // Get user ID and object choice for responding user
  // User ID is in user field for (G)DMs, and member for servers
  const userId = (interaction.member?.user?.id ?? interaction.user?.id) as string;
  const objectName = (comp.data as any).values[0];
  // Calculate result from helper function
  const resultStr = getResult(activeGames[gameId], {
    id: userId,
    objectName,
  });

  // Remove game from storage
  delete activeGames[gameId];
  // Update message with token in request body
  const endpoint = `webhooks/${config.applicationId}/${interaction.token}/messages/${interaction.message?.id}`;

  try {
    // Send results
    await res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: resultStr,
          },
        ],
      },
    });
    // Update ephemeral message
    await DiscordRequest(endpoint, {
      method: "PATCH",
      body: {
        components: [
          {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: "Nice choice " + getRandomEmoji(),
          },
        ],
      },
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
}
