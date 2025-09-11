
import { http } from '@google-cloud/functions-framework';

import app from './app.js';

// Export the Express app as a Cloud Function
http('discordBot', app);