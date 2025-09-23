import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { addCharacter as createCharacter } from "./createCharacter.js";
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
      name: createCharacter.command.name,
      description: 'Create a character to the app'
    },
    {
      type: 1,
      name: showCharacter.command.name,
      description: 'Show a characters details.'
    },
    {
      type: 1,
      name: listCharacter.command.name,
      description: 'List all characters'
    },
    {
      type: 1,
      name: updateCharacterDescription.command.name,
      description: 'Update a character description'
    },
    {
      type: 1,
      name: listAttunements.command.name,
      description: 'List all attunements for a character.'
    },
    {
      type: 1,
      name: listMagicItems.command.name,
      description: 'List all items for a character.'
    },
  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  req.log.info("Subcommand is %s", subcommand);
  switch (subcommand) {
    case createCharacter.command.name:
      createCharacter.initiate(req, res);
      break;
    case showCharacter.command.name:
        showCharacter.initiate(req, res);
        break;
    case listCharacter.command.name:
      listCharacter.initiate(req, res);
      break;
    case listAttunements.command.name:
      listAttunements.initiate(req, res);
      break;
    case listMagicItems.command.name:
      listMagicItems.initiate(req, res);
      break;
    case updateCharacterDescription.command.name:
      updateCharacterDescription.initiate(req, res);
      break;
    default:
      req.log.error("No subcommand found for %s", subcommand);
      break;
  }
}



export const characterRoot: CommandGroupHandler = {
  command: CHARACTER_COMMAND,
  initiate: handleInitiate,
}
