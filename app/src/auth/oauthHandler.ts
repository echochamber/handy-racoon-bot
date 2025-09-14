import express, { Request, Response } from 'express';
import tokenDao, { OAuthToken } from '../storage/entities/oauthToken.js';
import { config } from '@/config.js';
import { db } from '@/storage/firebase.js';
import { DiscordClientImpl } from '@/discord/discordAPI.js';

const router = express.Router();

const DISCORD_AUTH_SERVER = "https://discord.com";

// Endpoint to receive OAuth credentials (e.g., code, state)
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'OAuth error', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Import the OAuthToken entity and a method to save it

  // Example: Exchange code for access token (pseudo-code, replace with real implementation)
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code as string,
    client_id: config.OAUTH_CLIENT_ID,
    client_secret: config.OAUTH_CLIENT_SECRET,
    redirect_uri: config.OAUTH_REDIRECT_URI,
  });

  const  reqBod = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params,
  };
  const reqPath = `${DISCORD_AUTH_SERVER}/api/oauth2/token`;
  console.log(reqPath, reqBod);
  const tokenResponse = fetch(reqPath, reqBod);
  const tokenData = await tokenResponse.then(response => {
      if (!response.ok) {
          // Check for non-2xx status codes and handle them
          console.error('API request failed with status:', response.status);
      }
      return response.text(); // Get raw text instead of trying to parse as JSON immediately
  })
  .then(responseText => {
      console.log('Raw response:', responseText);
      // Only attempt JSON parsing if the response is expected to be JSON
      try {
          const jsonData = JSON.parse(responseText);
          return jsonData
          // Process jsonData
      } catch (e) {
          console.error('Error parsing JSON:', e);
          // Handle cases where the response is not valid JSON
      }
  })
  .catch(error => console.error('Fetch error:', error));
  if (!tokenData) {
    console.error("Token exchange failed");
    return;
  }

  // Store the relevant parts of the token
  const oauthToken: OAuthToken = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type,
    scope: tokenData.scope,
    receivedAt: new Date()
  };
  console.log(oauthToken)
  const client = new DiscordClientImpl(oauthToken.accessToken, false);
  const userRes = await client.currentUser();
  const user = await userRes.json();
  const userId = user.id;



  await tokenDao.saveToken(userId, oauthToken);




  // TODO: Exchange code for access token with the auth server here

  // For now, just respond with the received code and state
  res.json({ userId });
});

router.get('/userinfo/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Get the user's OAuth token from storage
    const oauthToken: OAuthToken | null = await tokenDao.getToken(userId);
    if (!oauthToken) {
      return res.status(404).json({ error: 'User token not found' });
    }

    // Use the DiscordClientImpl to fetch user info
    const client = new DiscordClientImpl(oauthToken.accessToken, false);
    const userRes = await client.currentUser();
    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: 'Failed to fetch user info from Discord' });
    }
    const userInfo = await userRes.json();

    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: (err as Error).message });
  }
});

export default {
  router
};