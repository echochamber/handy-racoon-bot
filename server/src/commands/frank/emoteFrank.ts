import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Request, Response } from 'express';
import { simpleGifResponse } from './frankRoot.js';
import { FRANK_EMOTE_GIF_MAP } from './constants.js';

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
    const keys = Object.keys(FRANK_EMOTE_GIF_MAP);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const key = def.gifKey === 'random' ? keys[randomIndex] : def.gifKey;
    console.log(keys, randomIndex, key);
    return simpleGifResponse(req, res, key);
  }

  return {
    command: cmd,
    initiate: initiate,
  }

}
export const askFrankCommand = makeEmoteCommand({name: 'consult', description: 'Consult franks infinite wisdom.', gifKey: 'cozy'})
export const moodCommand = makeEmoteCommand({name: 'mood', description: 'Inquire about franks mood.', gifKey: 'random'})