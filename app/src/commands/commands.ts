import { TEST_COMMAND, testCommandExp } from "@/demo/testCommand.js";
import { frankRoot } from "./frank/frankRoot.js";
import { magicItemRoot } from "./magicItem/magicItemRoot.js";
import { characterRoot } from "./character/characterRoot.js";
import { config } from "@/config.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";


const rootCommands: CommandGroupHandler[] = [
  testCommandExp,
  magicItemRoot,
  characterRoot,
];
if (config.RUNTIME_ENV == "LOCAL") {
  rootCommands.push(frankRoot)
}
export const ALL_COMMANDS = rootCommands.map(c => c.command);
export const ALL_COMMANDS_MAP = Object.fromEntries(
  rootCommands.map(entry => [entry.command.name, entry])
);

export interface CommandGroupHandler {
  command: RESTPostAPIApplicationCommandsJSONBody,
  initiate: (req: Request, res: Response) => any
}