import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { addCharacter as createCharacter } from "./addCharacter.js";
import { listCharacter } from "./listCharacters.js";
import { updateCharacterDescription } from "./updateCharacterDescription.js";
import { listAttunements } from "./listAttunements.js";
import { listMagicItems } from "./listMagicItems.js";
import { showCharacter } from "./showCharacter.js";
import { CommandGroupHandler as CommandGroupHandler } from "../commands.js";

export const CHARACTER_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'character',
  description: 'Manage RPG characters',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: 1,
      name: 'create',
      description: 'Create a character to the app'
    },
    {
      type: 1,
      name: 'show',
      description: 'Show a characters details.'
    },
    {
      type: 1,
      name: 'list',
      description: 'List all characters'
    },
    {
      type: 1,
      name: 'update-description',
      description: 'Update a character description'
    },
    {
      type: 1,
      name: 'attunements',
      description: 'List all attunements for a character.'
    },
    {
      type: 1,
      name: 'items',
      description: 'List all items for a character.'
    },
  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  console.log(subcommand);
  switch (subcommand) {
    case 'create':
      createCharacter.initiate(req, res);
      break;
    case 'show':
        showCharacter.initiate(req, res);
        break;
    case 'list':
      listCharacter.initiate(req, res);
      break;
    case 'attunements':
      listAttunements.initiate(req, res);
      break;
    case 'items':
      listMagicItems.initiate(req, res);
      break;
    case 'update-description':
      updateCharacterDescription.initiate(req, res);
      break;
  }
}



export const characterRoot: CommandGroupHandler = {
  command: CHARACTER_COMMAND,
  initiate: handleInitiate,
}
