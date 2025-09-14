import { Response } from 'express';
import 'dotenv/config';
import { config } from '@/config.js';
import { ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { InteractionResponseFlags } from 'discord-interactions';


export async function lookupUser(userId: Number) {
  return await DiscordRequest(`users/${userId}`, { method: "GET" })
}

export async function DiscordRequest(endpoint: string, options: any) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${config.botToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(url, res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}