import { TEST_COMMAND, testCommandExp } from "@/demo/testCommand.js";
import { frankRoot } from "./frank/frankRoot.js";
import { magicItemRoot } from "./magicItem/magicItemRoot.js";
import { characterRoot } from "./character/characterRoot.js";
import { config } from "@/config.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";


const devOnlyCommands: CommandGroupHandler[] = [];
let rootCommands: CommandGroupHandler[] = [
  testCommandExp,
  magicItemRoot,
  characterRoot,
  frankRoot,
];
if (config.RUNTIME_ENV == "LOCAL") {
  rootCommands = [...rootCommands, ...devOnlyCommands]
}
export const ALL_COMMANDS = rootCommands.map(c => c.command);
export const ALL_COMMANDS_MAP = Object.fromEntries(
  rootCommands.map(entry => [entry.command.name, entry])
);

/**
 * A group of commands that are subcommands of a command. See discord command groups.
 * 
 */
export interface CommandGroupHandler {
  command: RESTPostAPIApplicationCommandsJSONBody,
  initiate: (req: Request, res: Response) => any
}