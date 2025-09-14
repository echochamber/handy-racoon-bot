import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { addItem } from "./createItem.js";
import { attuneItem } from "./attuneItem.js";
import { listAttunements } from "../character/listAttunements.js";
import { listMagicItems } from "../character/listMagicItems.js";
import { unattuneItem } from "./unattuneItem.js";
import { transferItem } from "./transferItem.js";

export const MAGIC_ITEM_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'item',
  description: 'Manage Magic Items',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: 1,
      name: 'create',
      description: 'Add a magic item to the app'
    },
    {
      type: 1,
      name: 'attune',
      description: 'Attune to a magic item'
    },
    {
      type: 1,
      name: 'unattune',
      description: 'Unattune to a magic item'
    },
    {
      type: 1,
      name: 'list',
      description: 'List all magic items'
    },
    {
      type: 1,
      name: 'transfer',
      description: 'Transfer an item from one character to another.'
    },
  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  switch (subcommand) {
    case 'create':
      addItem.initiate(req, res);
      break;
    case 'attune':
      attuneItem.initiate(req, res);
      break;
    case 'unattune':
      unattuneItem.initiate(req, res);
      break;
      break;
    case 'transfer':
      transferItem.initiate(req, res);
      break;
    case 'list':
      listMagicItems.initiate(req, res);
      break;
  }
}

export const magicItemRoot = {
  command: MAGIC_ITEM_COMMAND,
  initiate: handleInitiate,
}
