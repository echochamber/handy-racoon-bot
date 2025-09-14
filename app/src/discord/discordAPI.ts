import { Response } from 'express';
import 'dotenv/config';
import { config } from '@/config.js';
import { ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { InteractionResponseFlags } from 'discord-interactions';


export async function lookupUser(userId: Number | string) {
  return await executeDiscordRequest(`users/${userId}`, { method: "GET" })
}

export interface DiscordClient {
  token: string;
  isBot: boolean;
}

export interface Headers {
  Authorization: string,
}

export class DiscordClientImpl implements DiscordClient {
  token: string;
  isBot: boolean;

  constructor(token: string, isBot: boolean = true) {
    this.token = token;
    this.isBot = isBot;
  }

  private getAuthHeader(): Headers {
    return this.isBot
      ? { Authorization: `Bot ${this.token}` }
      : { Authorization: `Bearer ${this.token}` };
  }

  async get(endpoint: string, options: any = {}): Promise<globalThis.Response> {
    return executeDiscordRequest(endpoint, { ...options, method: 'GET' }, this.isBot ? undefined : this.getAuthHeader()  );
  }

  async post(endpoint: string, body: any, options: any = {}): Promise<globalThis.Response> {
    return executeDiscordRequest(endpoint, { ...options, method: 'POST', body }, this.isBot ? undefined : this.getAuthHeader() );
  }

  async put(endpoint: string, body: any, options: any = {}): Promise<globalThis.Response> {
    return executeDiscordRequest(endpoint, { ...options, method: 'PUT', body }, this.isBot ? undefined : this.getAuthHeader() );
  }

  async delete(endpoint: string, options: any = {}): Promise<globalThis.Response> {
    return executeDiscordRequest(endpoint, { ...options, method: 'DELETE' }, this.isBot ? undefined : this.getAuthHeader() );
  }
  async lookupUser(userId: Number | string) {
    return await this.get(`users/${userId}`)
  }
  async currentUser(): Promise<globalThis.Response> {
    return await this.lookupUser('@me')
  }
}

// curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://discord.com/api/users/@me

export async function executeDiscordRequest(endpoint: string, options: any, authHeader?: Headers) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  
  const headers = authHeader ? authHeader : defaultBotHeader();
  const res = await fetch(url, {
    headers: {
      ...headers,
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


function defaultBotHeader() {
  return {
      Authorization: `Bot ${config.BOT_TOKEN}`,
  }
}