import {verifyKeyMiddleware} from 'discord-interactions';
import express from 'express';
import { handleAcceptChallege, handleInitiateChallenge, handleSelectChoice } from './demo/challengeCommand.js';
import { getRandomEmoji } from './utils.js';
import { config, constants } from './config.js'
import { handleTest } from './demo/testCommand.js';
import { tryIt, tryIt2, tryIt3 } from './storage/fbScrappy.js';
import { db } from './storage/firebase.js';
import { addCharacter } from './commands/addCharacter.js';
import { APIInteraction, InteractionType } from 'discord-api-types/v10';
import e from 'express';

// Create an express app
const app = express();

app.get('/', async function (req, res) {
  console.log("Root Req Received");
  return res.send({content: `hello world ${getRandomEmoji()}`});
});

app.get('/local', async function (req, res) {
  const [res1, res2] = await tryIt(db);
  console.log(`Results are (${res1.writeTime}, ${res2.writeTime})`);
  return res.send({content: `hello world ${getRandomEmoji()}`});
});

app.get('/local2', async function (req, res) {
  const res1 = await tryIt3(db);
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
  if (type === InteractionType.ApplicationCommand) {
    const interaction = req.body as APIInteraction;
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return handleTest(interaction, res);
    } else if (name === 'challenge' && id) {
      return handleInitiateChallenge(req, res);
    } else if (name === 'add_character' && id) {
      console.log(`Adding character: ${name}`);
      return addCharacter.handleInitiate(req, res);
    } else {
    // if (name === 'add_character_submit' && id) {
    //   return addCharacter.handleModalSubmission(req, res);
    // }
      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: 'unknown command' });
    }


  } else if (type === InteractionType.ModalSubmit) {
    console.log(JSON.stringify(req.body))
    if (data.custom_id === 'add_character' && id) {
      console.error(`Submission received:`);
      return addCharacter.handleModalSubmission(req, res);
    } else {
      console.error(`unknown command: ${data.custom_id}`);
      return res.status(400).json({ error: 'unknown command' });
    }
  } else if (type === InteractionType.MessageComponent) {
    const { name } = data;
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

    if (componentId.startsWith('accept_button_')) {
      await handleAcceptChallege(req, res, componentId);

    } else if (componentId.startsWith('select_choice_')) {
      await handleSelectChoice(req, res, componentId);
    } else {
      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: 'unknown command' });
    }
  } else {
    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
  }
});


export default app;