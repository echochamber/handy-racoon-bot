import {
  InteractionType,
  verifyKeyMiddleware
} from 'discord-interactions';
import express from 'express';
import { handleAcceptChallege, handleInitiateChallenge, handleSelectChoice } from './demo/rpsCommand.js';
// import { handleTest } from '@/demo/testCommand.js';
import { getRandomEmoji } from './utils.js';
import { config } from './config.js'
import { handleTest } from './demo/testCommand.js';

// Create an express app
const app = express();

app.get('/', async function (req, res) {
  console.log("Root Req Received");
  return res.send({content: `hello world ${getRandomEmoji()}`});
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(config.PUBLIC_KEY), async function (req, res) {
  console.log("Request received");
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return handleTest(req, res);
    }
    if (name === 'challenge' && id) {
      return handleInitiateChallenge(req, res);
    }


    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_button_')) {
      await handleAcceptChallege(req, res, componentId);

    } else if (componentId.startsWith('select_choice_')) {
      await handleSelectChoice(req, res, componentId);
    }

    return;
  }


  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});


export default app;