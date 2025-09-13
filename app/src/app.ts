import {verifyKeyMiddleware} from 'discord-interactions';
import express from 'express';
import { handleAcceptChallege, handleInitiateChallenge, handleSelectChoice } from './demo/challengeCommand.js';
import { config } from './config.js'
import { handleTest } from './demo/testCommand.js';
import { tryIt, tryIt2, tryIt3 } from './storage/fbScrappy.js';
import { db } from './storage/firebase.js';
import { addCharacter } from './commands/addCharacter.js';
import { InteractionType } from 'discord-api-types/v10';
import { listCharacter } from './commands/listCharacters.js';
import { getRandomEmoji } from './util/misc.js';
import { addItem } from './commands/addItem.js';
import { attuneItem } from './commands/attuneItem.js';
import { listAttunements } from './commands/listAttunements.js';

function handleApplicationCommand(req: any, res: any, data: any, id: any) {
  const { name } = data;

  switch (name) {
    case 'test':
      console.log(`Test time: ${name}`);
      return handleTest(req, res);
    case 'challenge':
      if (id) {
        return handleInitiateChallenge(req, res);
      }
      break;
    case addCharacter.command.name:
      if (id) {
        return addCharacter.initiate(req, res);
      }
      break;
    case addItem.command.name:
      if (id) {
        return addItem.initiate(req, res);
      }
      break;
    case listCharacter.command.name:
      if (id) {
        return listCharacter.list(req, res);
      }
      break;
    case listAttunements.command.name:
      if (id) {
        return listAttunements.initiate(req, res);
      }
      break;
    case attuneItem.command.name:
      if (id) {
        return attuneItem.initiate(req, res);
      }
      break;
    default:
      res.status(400).json({ error: 'unknown command' });
      console.error(`unknown command: ${name}`);
      throw new Error(`Unknown command: ${name}`);
  }
}

function handleModalSubmit(req: any, res: any, data: any, id: any) {
  if (data.custom_id === addCharacter.submit_id && id) {
    console.log(`Submission received:`);
    return addCharacter.submit(req, res);
  } else if (data.custom_id === addItem.submit_id && id) {
    console.log(`Add Item Submission received:`);
    return addItem.submit(req, res);
  } else {
    res.status(400).json({ error: 'unknown command' });
    console.error(`unknown command: ${data.custom_id}`);
    throw new Error(`unknown command: ${data.custom_id}`);
  }
}

async function handleMessageComponent(req: any, res: any, data: any, id: any) {
  const { name } = data;
  const componentId = data.custom_id;

  if (componentId.startsWith('accept_button_')) {
    await handleAcceptChallege(req, res, componentId);
  } else if (componentId.startsWith('select_choice_')) {
    await handleSelectChoice(req, res, componentId);
  } else if (componentId == attuneItem.select_character_id) {
    attuneItem.characterSelect(req, res);
  } else if (componentId == listAttunements.select_character_id) {
    listAttunements.handle(req, res);
  } else if (componentId == attuneItem.select_item_id) {
    attuneItem.itemSelect(req, res);
  } else {
    console.error(`unknown command: ${componentId}`);
    res.status(400).json({ error: 'unknown command' });
    throw new Error(`Unknown interaction type: ${name}`);
  }
}

const app = express();
app.get('/', async function (req, res) {
  console.log("Request received");
  return res.send({content: `hello world ${getRandomEmoji()}`});
});
app.get('/local', async function (req, res) {
  console.log("Request received");
  const [res1, res2] = await tryIt(db);
  console.log(`Results are (${res1.writeTime}, ${res2.writeTime})`);
  return res.send({content: `hello world ${getRandomEmoji()}`});
});
app.get('/local2', async function (req, res) {
  console.log("Request received");
  const res1 = await tryIt3(db);
  return res.send({content: `hello world ${getRandomEmoji()}`});
});


app.post('/interactions', verifyKeyMiddleware(config.publicKey), async function (req, res) {
  console.log("Request received");
  const { id, type, data } = req.body;

  // Slash commands
  switch (type) {
    case InteractionType.ApplicationCommand: {
      return handleApplicationCommand(req, res, data, id);
    }
    case InteractionType.ModalSubmit: {
      return handleModalSubmit(req, res, data, id);
    }
    case InteractionType.MessageComponent: {
      return handleMessageComponent(req, res, data, id);
    }
    default:
      console.error('unknown interaction type', type);
      res.status(400).json({ error: 'unknown interaction type' });
      throw new Error(`Unknown interaction type: ${type}`);
  }
});


export default app;