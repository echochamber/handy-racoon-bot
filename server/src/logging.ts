import * as pHttp from 'pino-http';
import { config } from './config.js';
import path from 'node:path';
import { existsSync } from 'node:fs';
import pino, { TransportSingleOptions, LoggerOptions } from 'pino';

function callerHookEnabled() {
  return config.RUNTIME_ENV === 'LOCAL';
}

// Resolve once: nearest directory (from CWD upward) that has a package.json
const PROJECT_ROOT = (() => {
  let dir = process.cwd();
  const { root } = path.parse(dir);
  while (dir !== root) {
    if (existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
})();

// Extract "file:line" and make the path relative to PROJECT_ROOT
function getCaller(skip = 3): string | undefined {
  const err = new Error();
  const lines = (err.stack || '').split('\n');
  const line = lines[skip] || '';
  const m =
    /\((.*):(\d+):\d+\)/.exec(line) ||
    /at (.*):(\d+):\d+/.exec(line);

  if (!m) return;
  const [, absFile, lineno] = m;

  // Make relative to project root if possible
  let rel = path.relative(PROJECT_ROOT, absFile);
  if (rel.startsWith('..')) rel = absFile;
  rel = rel.split(path.sep).join('/');

  // Wrap in square brackets
  return `[${rel}:${lineno}]`;
}

const basePinoOptions: LoggerOptions = {
  level: config.LOG_LEVEL,
};

// Only add the hook locally (pretty/console mode)
const pinoOptions: LoggerOptions = callerHookEnabled()
  ? {
      ...basePinoOptions,
      hooks: {
        logMethod(args, method) {
          // Put caller as a field on the log line
          const caller = getCaller(4); // tweak if you see off-by-one frames
          if (caller) {
            if (typeof args[0] === 'object' && args[0] !== null) {
              args[0] = { ...args[0], caller };
            } else {
              args.unshift({ caller });
            }
          }
          method.apply(this, args);
        },
      },
    }
  : basePinoOptions;

const stdoutTransport: TransportSingleOptions =
  config.RUNTIME_ENV == 'LOCAL'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,req,res,hostname', // hide noise
          translateTime: 'HH:MM:ss.l',
          // Show the caller next to the message (if present)
          messageFormat: '{msg} {#caller,cyan}',
        },
      }
    : { target: 'pino/file' };

const appLogTransport: TransportSingleOptions = {
  target: 'pino/file',
  options: { destination: config.LOGFILE_PATH },
};

const transports = pino.transport({
  targets: [
    // appLogTransport,
    stdoutTransport],
});

const pinoLogger = pino(pinoOptions, transports);

const logger = pHttp.pinoHttp({
  logger: pinoLogger,
  serializers: {
    req(req: any) {
      const { headers: _, ...result } = req;
      return result;
    },
  },
});

export default logger;
