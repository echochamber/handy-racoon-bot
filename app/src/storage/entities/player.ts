import { DocumentReference, FieldValue, Firestore } from "firebase-admin/firestore";

import { Character } from "./character.js"

export interface Player {
  discordUser: string;
  discordId: string;
  characters: Character[];
}


export async function findByDiscordId(db: Firestore, discordId: string): Promise<Player | undefined> {
  const playerRef: FirebaseFirestore.DocumentSnapshot = await db.collection('players').doc(discordId).get()
  // .doc(discordId).get()
  const data = playerRef.data();
  if (!data) {
    return;
  }
  return {
    discordUser: data.discordUser,
    discordId: data.discordId,
    characters: data.characters || []
  };
}

export async function findOrCreate(db: Firestore, discordId: string, discordName: string): Promise<Player> {
  const existingPlayer = await findByDiscordId(db, discordId);
  if (existingPlayer) {
    return existingPlayer;
  }

  const newPlayer: Player = {
    discordUser: discordName,
    discordId: String(discordId),
    characters: []
  };

  await db.collection('players').doc(discordId).set(newPlayer);

  return newPlayer;
}

export const playerDao = {
  findByDiscordId,
  findOrCreate
}

