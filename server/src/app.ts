import { InteractionType } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { Request, Response } from 'express';
import { addCharacter } from './commands/character/createCharacter.js';

// Extend Express Request type to include 'log'
import oauthCallback from './auth/oauthHandler.js';
import { listAttunements } from './commands/character/listAttunements.js';
import { listMagicItems } from './commands/character/listMagicItems.js';
import { showCharacter } from './commands/character/showCharacter.js';
import { updateCharacterDescription } from './commands/character/updateCharacterDescription.js';
import { ALL_COMMANDS_MAP } from './commands/commands.js';
import { attuneItem } from './commands/magicItem/attuneItem.js';
import { createItem as createItem } from './commands/magicItem/createItem.js';
import { transferItem } from './commands/magicItem/transferItem.js';
import { unattuneItem } from './commands/magicItem/unattuneItem.js';
import { config } from './config.js';
import logger from './logging.js';
import { tryIt, tryIt3 } from './storage/fbScrappy.js';
import { db } from './storage/firebase.js';
import { getRandomEmoji } from './util/misc.js';
import { addRoutes } from './appRoutes.js';
import { HttpLogger } from 'pino-http';



const app = express();
app.use(express.json());
app.use(logger)

app.use('/auth/oauth', oauthCallback.router);
addRoutes(app);


logger.logger.info(`To authorize oauth go to https://discord.com/oauth2/authorize?client_id=${config.OAUTH_CLIENT_ID}&redirect_uri=${config.OAUTH_REDIRECT_URI}&response_type=code&scope=guilds`)
export default app;