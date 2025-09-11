import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import { CHALLENGE_COMMAND } from './demo/challengeCommand.js';
import { TEST_COMMAND } from './demo/testCommand.js';


const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);