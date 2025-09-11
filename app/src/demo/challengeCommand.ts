import { getShuffledOptions, getResult, ActiveGame, getRPSChoices } from "../game.js";
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";

import { Request, Response } from 'express';

import { getRandomEmoji, DiscordRequest, capitalize } from "../utils.js";
import { config } from "../config.js";


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

export const CHALLENGE_COMMAND = {
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

export function handleInitiateChallenge(req: Request, res: Response) {
  const { id } = req.body;
  // Interaction context
  const context = req.body.context;
  // User ID is in user field for (G)DMs, and member for servers
  const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
  // User's object choice
  const objectName = req.body.data.options[0].value;

  // Create active game using message ID as the game ID
  activeGames[id] = {
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
  // get the associated game ID
  const gameId = componentId.replace("accept_button_", "");
  // Delete message with token in request body
  const endpoint = `webhooks/${config.APPLICATION_ID}/${req.body.token}/messages/${req.body.message.id}`;
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
  const { data } = req.body;

  // get the associated game ID
  const gameId = componentId.replace("select_choice_", "");

  if (activeGames[gameId]) {
    // Interaction context
    const context = req.body.context;
    // Get user ID and object choice for responding user
    // User ID is in user field for (G)DMs, and member for servers
    const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
    const objectName = data.values[0];
    // Calculate result from helper function
    const resultStr = getResult(activeGames[gameId], {
      id: userId,
      objectName,
    });

    // Remove game from storage
    delete activeGames[gameId];
    // Update message with token in request body
    const endpoint = `webhooks/${config.APPLICATION_ID}/${req.body.token}/messages/${req.body.message.id}`;

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
}
