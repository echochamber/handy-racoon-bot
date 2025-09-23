import { InteractionType } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { Request, Response } from 'express';
import { addCharacter } from './commands/character/createCharacter.js';

// Extend Express Request type to include 'log'
import oauthCallback from './auth/oauthHandler.js';
import { listAttunements } from './commands/character/listAttunements.js';
import { listMagicItems } from './commands/character/listMagicItems.js';
import { showCharacter } from './commands/character/showCharacter.js';
import { updateCharacterDescription } from './commands/character/updateCharacterDescription.js';
import { ALL_COMMANDS_MAP } from './commands/commands.js';
import { attuneItem } from './commands/magicItem/attuneItem.js';
import { createItem as createItem } from './commands/magicItem/createItem.js';
import { transferItem } from './commands/magicItem/transferItem.js';
import { unattuneItem } from './commands/magicItem/unattuneItem.js';
import { config } from './config.js';
import { tryIt, tryIt3 } from './storage/fbScrappy.js';
import { db } from './storage/firebase.js';
import { getRandomEmoji } from './util/misc.js';



function logAndSendError(req: Request, res: Response, msg: string) {
  res.status(400).json({ error: msg });
  req.log.error(msg);
  throw new Error(msg);
}

/**
 * Handle application commands, aka slash commands.
 * @param req express.Request
 * @param res express.Response
 * @returns 
 */
function handleApplicationCommand(req: any, res: any) {
  const { data } = req.body;
  const { name } = data;

  for (const key in ALL_COMMANDS_MAP) {
    const commandGroupHandler = ALL_COMMANDS_MAP[key];
    if (commandGroupHandler.command.name === name) {
      req.log.info("Found command for %s", name)
      return commandGroupHandler.initiate(req, res);
    }
  }
  logAndSendError(req, res, `Unknown command: ${name}`);
}

/**
 * Handle modal form submissions.
 * @param req express.Request
 * @param res express.Response
 * @returns 
 */
function handleModalSubmit(req: any, res: any) {
  const {data, id} = req.body
  const errMsg = `unknown custom_id from modal submit: ${data.custom_id}`;
  if (!id) {
    logAndSendError(req, res, errMsg);
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
    logAndSendError(req, res, errMsg);
  }
}

/**
 * Handles requests related to interacting with an existing message.
 * @param req express.Request
 * @param res express.Response
 * @returns 
 */
async function handleMessageComponent(req: any, res: any) {
  const {data} = req.body;
  const componentId = data.custom_id;

  if (!componentId) {
    logAndSendError(req, res, 'Missing componentId');
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
  logAndSendError(req, res, `Unknown interaction type ${componentId}`);
}

export function addRoutes(app: express.Application) {
    // Random endpoints for debugging.
  app.get('/', async function (req: Request, res: Response) {
    return res.send({content: `hello world ${getRandomEmoji()}`});
  });
  app.get('/local', async function (req, res) {
    const [res1, res2] = await tryIt(db);
    req.log.info(`Results are (${res1.writeTime}, ${res2.writeTime})`);
    return res.send({content: `hello world ${getRandomEmoji()}`});
  });
  app.get('/local2', async function (req, res) {
    const res1 = await tryIt3(db);
    return res.send({content: `hello world ${getRandomEmoji()}`});
  });


  app.post('/interactions', verifyKeyMiddleware(config.PUBLIC_KEY), async function (req, res) {
    req.log.info(`Called, ${req.body.type}`);
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
        logAndSendError(req, res, `Unknown interaction type: ${type}`)
    }
  });

return app;
}