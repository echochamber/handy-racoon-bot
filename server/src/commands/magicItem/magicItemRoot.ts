import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { createItem } from "./createItem.js";
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
      name:  createItem.command.name,
      description: 'Add a magic item to the app'
    },
    {
      type: 1,
      name: attuneItem.command.name,
      description: 'Attune to a magic item'
    },
    {
      type: 1,
      name:  unattuneItem.command.name,
      description: 'Unattune to a magic item'
    },
    {
      type: 1,
      name: listMagicItems.command.name,
      description: 'List all magic items'
    },
    {
      type: 1,
      name: transferItem.command.name,
      description: 'Transfer an item from one character to another.'
    },
  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  switch (subcommand) {
    case createItem.command.name:
      createItem.initiate(req, res);
      break;
    case attuneItem.command.name:
      attuneItem.initiate(req, res);
      break;
    case unattuneItem.command.name:
      unattuneItem.initiate(req, res);
      break;
      break;
    case transferItem.command.name:
      transferItem.initiate(req, res);
      break;
    case listAttunements.command.name:
      listMagicItems.initiate(req, res);
      break;
  }
}



export const magicItemRoot = {
  command: MAGIC_ITEM_COMMAND,
  initiate: handleInitiate,
}
