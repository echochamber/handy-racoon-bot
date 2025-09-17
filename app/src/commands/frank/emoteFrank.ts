import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Request, Response } from 'express';
import { simpleGifResponse } from './frankRoot.js';

export const FLEX_FRANK_COMMAND: RESTPostAPIApplicationCommandsJSONBody  = {
  name: 'flex',
  description: 'Make frank flex.',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
  integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
}

export async function initiate(req: Request, res: Response): Promise<globalThis.Response>
{
  return simpleGifResponse(req, res, "flex")
}

export const flexFrank = {
  command: FLEX_FRANK_COMMAND,
  initiate: initiate,
}

interface EmoteCommandDef {
  name: string,
  description: string,
  gifKey: string
}

function makeEmoteCommand(def: EmoteCommandDef) {
  const cmd: RESTPostAPIApplicationCommandsJSONBody  = {
    name: def.name,
    description: def.description,
    type: ApplicationCommandType.ChatInput,
    contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]
  }

  const initiate = async (req: Request, res: Response) => {
    return simpleGifResponse(req, res, def.gifKey);
  }

  return {
    command: cmd,
    initiate: initiate,
  }

}
export const askFrankCommand = makeEmoteCommand({name: 'ask', description: 'Consult franks infinite wisdom.', gifKey: 'cozy'})
export const flexCommand = makeEmoteCommand({name: 'flex', description: 'Make frank flex.', gifKey: 'flex'})