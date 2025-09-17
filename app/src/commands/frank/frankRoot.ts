import { ApplicationCommandType, InteractionResponseType, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Request, Response } from "express";
import { embedGif, frankBotWebHook } from "../discordMessageUtil.js";
import { askFrankCommand, flexCommand, flexCommand as frankFlexCommand } from "./emoteFrank.js";
import { CommandGroupHandler } from "../commands.js";

export const FRANK_ROOT_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: 'frank',
  description: 'Frank Commands',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: 1,
      name: 'ask',
      description: 'Consult frank\'s infinite wisdom'
    },
    {
      type: 1,
      name: 'flex',
      description: 'Make frank flex.'
    },

  ],
};

export function handleInitiate(req: Request, res: Response) {
  const subcommand = req.body.data.options[0].name;
  switch (subcommand) {
    case askFrankCommand.command.name:
      askFrankCommand.initiate(req, res);
      break;
    case flexCommand.command.name:
      frankFlexCommand.initiate(req, res);
      break;
  }
}


const EMOTE_GIF_MAP = {
  flex: {
    title: "Flexin'", 
    url: " https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3kybjVsZXBzY292eXhwa2N3aThzbTVwMHhwOXg0MjdwcWpmdGltMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/t9lBEE2FGMzbY9s5IX/giphy.gif"
  },
  cozy: {
    title: "Feelin' Cozy", 
    url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMngyamgwZXdteDN6eHlvb3NmMWZjMWMzZ3FkNG0xZHE4dHZtdzFweSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GkdnvLZIrKVxtSDG22/giphy.gif"
  }
}
export async function simpleGifResponse(req: Request, res: Response, emote: string): Promise<globalThis.Response> {
  res.send({type: InteractionResponseType.Pong,});
  return frankBotWebHook({
    embeds: [embedGif(EMOTE_GIF_MAP.cozy.title, EMOTE_GIF_MAP.cozy.url)]
  })
}

export const frankRoot: CommandGroupHandler = {
  command: FRANK_ROOT_COMMAND,
  initiate: handleInitiate,
}