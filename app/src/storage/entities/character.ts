import { FieldValue, Firestore } from "firebase-admin/firestore";
import { BaseDoc, docToEntity } from "./docBase.js";
import { MaxAttunementsExceededError } from "@/error.js";

export interface Character extends BaseDoc {
  name: string;
  description: string;
  attunedItemIds: string[];
}

export async function addCharacter(db: Firestore, discordId: string, character: Character, doLog?: boolean): Promise<Character> {
  const col = db.collection("characters");
  const now = FieldValue.serverTimestamp();
  const ref = await col.add({
    ...character,
    createdAt: now,
    updatedAt: now,
  });
  if (doLog) {
    console.log(character)
  }
  character.updatedAt = now;
  character.createdAt = now;
  character.meta = { id: ref.id, path: ref.path };

  return character;
}

export async function addAttunedItem(db: Firestore, characterId: string, itemId: string, doLog?: boolean) {
  const docRef = db.collection("characters").doc(characterId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Character not found");
  }

  const character = docSnap.data() as Character;

  const updatedAttunedItemIds = [...(character.attunedItemIds || []), itemId];
  await docRef.update({
    attunedItemIds: updatedAttunedItemIds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (doLog) {
    console.log(`Added attuned item ${itemId} to character ${characterId}`);
  }

  return true;
  
}

export async function getAllCharacters(db: Firestore) {
  try {
    const collection = await db.collection("characters").get();
    return collection.docs.map((doc) => docToEntity<Character>(doc));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function findCharacter(db: Firestore, id: string) {
  try {
    const d = await db.collection("characters").doc(id).get();
    return docToEntity<Character>(d);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateCharacter(
  db: Firestore,
  characterId: string,
  updates: Partial<Character>,
  doLog?: boolean
): Promise<Character> {
  const docRef = db.collection("characters").doc(characterId);
  const now = FieldValue.serverTimestamp();

  await docRef.update({
    ...updates,
    updatedAt: now,
  });

  const updatedDoc = await docRef.get();
  const updatedCharacter = docToEntity<Character>(updatedDoc);

  if (doLog) {
    console.log(`Updated character ${characterId}:`, updates);
  }

  return updatedCharacter;
}

export const characterDao = {
  create: addCharacter,
  find: findCharacter,
  all: getAllCharacters,
  addAttunedItem: addAttunedItem,
  update: updateCharacter
}