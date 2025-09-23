import { ApplicationCommandType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { embedGif, frankBotWebHook, simpleMessage, simpleUpdate } from "../discordMessageUtil.js";
import { askFrankCommand, moodCommand } from "./emoteFrank.js";
import { CommandGroupHandler } from "../commands.js";
import { FRANK_EMOTE_GIF_MAP } from "./constants.js";

export const FRANK_ROOT_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'frank',
  description: 'Frank Commands',
  type: ApplicationCommandType.ChatInput,
  options: [
    // {
    //   type: 1,
    //   name: askFrankCommand.command.name,
    //   description: askFrankCommand.command.description
    // },
    {
      type: 1,
      name: moodCommand.command.name,
      description: moodCommand.command.description
    },

  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  switch (subcommand) {
    case askFrankCommand.command.name:
      askFrankCommand.initiate(req, res);
      break;
    case moodCommand.command.name:
      moodCommand.initiate(req, res);
      break;
  }
}



export async function simpleGifResponse(req: Request, res: Response, emote: string): Promise<globalThis.Response> {
  res.send(simpleMessage(`${req.body.member.user.global_name} is inquiring about franks mood...`, false));
  console.log(`channel is ${req.body.channel.id}`);
  return (frankBotWebHook({
    embeds: [embedGif(FRANK_EMOTE_GIF_MAP[emote].title, FRANK_EMOTE_GIF_MAP[emote].url)]
  }, req.body.channel.id)).then(e => {    
    return e;
  });
}

export const frankRoot: CommandGroupHandler = {
  command: FRANK_ROOT_COMMAND,
  initiate: handleInitiate,
}