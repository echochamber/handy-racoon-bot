import { InteractionType } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { Request, Response } from 'express';
import { addCharacter } from './commands/character/addCharacter.js';
import { characterRoot } from './commands/character/characterRoot.js';
import { listAttunements } from './commands/character/listAttunements.js';
import { attuneItem } from './commands/magicItem/attuneItem.js';
import { addItem as createItem } from './commands/magicItem/createItem.js';
import { listMagicItems } from './commands/character/listMagicItems.js';
import { magicItemRoot } from './commands/magicItem/magicItemRoot.js';
import { transferItem } from './commands/magicItem/transferItem.js';
import { unattuneItem } from './commands/magicItem/unattuneItem.js';
import { config } from './config.js';
import { handleTest } from './demo/testCommand.js';
import { tryIt, tryIt3 } from './storage/fbScrappy.js';
import { db } from './storage/firebase.js';
import { getRandomEmoji } from './util/misc.js';
import { updateCharacterDescription } from './commands/character/updateCharacterDescription.js';
import { showCharacter } from './commands/character/showCharacter.js';

function logAndSendError(res: Response, msg: string) {
  res.status(400).json({ error: msg });
  console.error(msg)
  throw new Error(msg);
}

function handleApplicationCommand(req: any, res: any) {
  const { data } = req.body;
  const { name } = data;

  switch (name) {
    case 'test':
      console.log(`Test time: ${name}`);
      return handleTest(req, res);
    case characterRoot.command.name:
      console.log("hit");
      return characterRoot.initiate(req, res);
    case magicItemRoot.command.name:
      return magicItemRoot.initiate(req, res);
    default:
      logAndSendError(res, `Unknown command: ${name}`)
  }
}

function handleModalSubmit(req: any, res: any) {
  const {data, id} = req.body
  const errMsg = `unknown custom_id from modal submit: ${data.custom_id}`;
  if (!id) {
    logAndSendError(res, errMsg);
    return;
  }
  const modalHandlerMap: Record<string, (req: Request, res: Response) => any> = {
    [addCharacter.submit_id]: addCharacter.submit,
    [createItem.submit_id]: createItem.submit,
    [updateCharacterDescription.submit_id]: updateCharacterDescription.submit
  };

  const handler = modalHandlerMap[data.custom_id];
  if (handler) {
    return handler(req, res);
  } else {
    logAndSendError(res, errMsg);
  }
}

async function handleMessageComponent(req: any, res: any) {
  const { data} = req.body;
  const componentId = data.custom_id;

  if (!componentId) {
    logAndSendError(res, 'Missing componentId');
  }

  const componentHandlerMap: Record<string, (req: Request, res: Response) => any> = {
    [attuneItem.select_character_id]: attuneItem.characterSelect,
    [showCharacter.select_character_id]: showCharacter.handle,
    [attuneItem.select_item_id]: attuneItem.itemSelect,
    [listAttunements.select_character_id]: listAttunements.handle,
    [listMagicItems.select_character_id]: listMagicItems.handleCharacterSelect,
    [unattuneItem.select_character_id]: unattuneItem.handleCharacterSelect,
    [unattuneItem.select_item_id]: unattuneItem.handleItemSelect,
    [transferItem.select_from_character_id]: transferItem.fromCharacterSelect,
  };
  const prefixHandlers: [string, (req: Request, res: Response) => any][] = [
    [transferItem.select_item_id, transferItem.itemSelect],
    [transferItem.select_to_character_id, transferItem.toCharacterSelect],
  ];

  const handler = componentHandlerMap[componentId];
  if (handler) {
    handler(req, res);
    return;
  }

  const prefixHandler = prefixHandlers.find(([prefix]) => componentId.startsWith(prefix));
  if (prefixHandler) {
    const [, handlerFn] = prefixHandler;
    if (typeof handlerFn === 'function') {
      handlerFn(req, res);
      return;
    }
  }
  logAndSendError(res, `Unknown interaction type ${componentId}`);
}

const app = express();

// Random endpoints for debugging.
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
  const { type } = req.body;

  // Slash commands
  switch (type) {
    case InteractionType.ApplicationCommand: {
      return handleApplicationCommand(req, res);
    }
    case InteractionType.ModalSubmit: {
      return handleModalSubmit(req, res);
    }
    case InteractionType.MessageComponent: {
      return handleMessageComponent(req, res);
    }
    default:
      logAndSendError(res, `Unknown interaction type: ${type}`)
  }
});


export default app;