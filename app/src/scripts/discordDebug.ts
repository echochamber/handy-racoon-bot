import { config } from "@/config.js";
import { executeDiscordRequest } from "@/discord/discordAPI.js";


// const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
// const result = = executeDiscordRequest(endpoint, {
//   body: {

//   },
//   method:
// })




function tokenExchange() {
  let params = new URLSearchParams();
    params.append('client_id', config.OAUTH_CLIENT_ID);
    params.append('client_secret', config.OAUTH_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', process.argv[2]);
    params.append('redirect_uri', config.OAUTH_REDIRECT_URI);

    fetch('https://discord.com/api/oauth2/token', {
      method: 'post',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    }).then(r => r.json()).then(async res => {
      console.log(res);
    });
}
console.log(config);
tokenExchange()