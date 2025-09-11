import { Character } from "./character.js"

export interface Player {
  discordUser: string;
  alias: string;
  characters: Character[];
}


export function createEstler() {

}