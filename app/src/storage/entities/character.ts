import { FieldValue, Firestore } from "firebase-admin/firestore";
import { BaseDoc, docToEntity } from "./docBase.js";

export interface Character extends BaseDoc {
  name: string;
  description: string;
  attunedItemIds: string[];
}

export const STASH_ID = "100";
export const STASH_CHARACTER: Character = {
  meta: {
    id: STASH_ID,
    path: `characters/${STASH_ID}`
  },
  name: 'Stash',
  description: 'Items not owned by anyone.',
  attunedItemIds: []
}

export async function createStash(db: Firestore) {
  return await characterDao.create(db, STASH_CHARACTER);
}

export async function create(db: Firestore, character: Character, discordId?: string, doLog?: boolean): Promise<Character> {
  const charCol = db.collection("characters");
  const now = FieldValue.serverTimestamp();
  const charToWrite = {
    ...character,
    createdAt: now,
    updatedAt: now,
  }
  if (character.meta && character.meta.id) {
    await charCol.doc(character.meta.id).set(charToWrite);
    return character
  }
  const ref = await charCol.add(charToWrite);
  if (doLog) {
    console.log(character)
  }
  character.updatedAt = now;
  character.createdAt = now;
  character.meta = { id: ref.id, path: ref.path };

  return character;
}

export async function attuneItem(db: Firestore, characterId: string, itemId: string, doLog?: boolean) {
  const docRef = db.collection("characters").doc(characterId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Character not found");
  }

  const character = docSnap.data() as Character;

  const updatedAttunedItemIds = character.attunedItemIds ?? [];
  updatedAttunedItemIds.push(itemId);
  await docRef.update({
    attunedItemIds: updatedAttunedItemIds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (doLog) {
    console.log(`Added attuned item ${itemId} to character ${characterId}`);
  }

  return true; 
}

export async function unattuneItem(db: Firestore, characterId: string, itemId: string, doLog?: boolean) {
  const docRef = db.collection("characters").doc(characterId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Character not found");
  }

  const character = docSnap.data() as Character;
  const updatedAttunedItemIds = (character.attunedItemIds || []).filter(id => id !== itemId);

  await docRef.update({
    attunedItemIds: updatedAttunedItemIds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (doLog) {
    console.log(`Removed attuned item ${itemId} from character ${characterId}`);
  }

  return true;
}

export async function all(db: Firestore) {
  try {
    const collection = await db.collection("characters").get();
    return collection.docs.map((doc) => docToEntity<Character>(doc));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function find(db: Firestore, id: string) {
  try {
    const d = await db.collection("characters").doc(id).get();
    return docToEntity<Character>(d);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function findByName(db: Firestore, name: string): Promise<Character[]> {
  try {
    const querySnap = await db.collection("characters").where("name", "==", name).get();
    return querySnap.docs.map((doc) => docToEntity<Character>(doc));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function update(
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

export async function transferItem(
  db: Firestore,
  fromCharacterId: string,
  toCharacterId: string,
  itemId: string,
  doLog?: boolean
) {
  const characterCol = db.collection("characters");
  const itemCol = db.collection("magicItems");
  const fromRef = characterCol.doc(fromCharacterId);
  const toRef = characterCol.doc(toCharacterId);
  const itemRef = itemCol.doc(itemId);

  await db.runTransaction(async (transaction) => {
    const [fromSnap, toSnap, itemSnap] = await Promise.all([
      transaction.get(fromRef),
      transaction.get(toRef),
      transaction.get(itemRef),
    ]);

    if (!fromSnap.exists) throw new Error("Source character not found");
    if (!toSnap.exists) throw new Error("Target character not found");
    if (!itemSnap.exists) throw new Error("Item not found");
    

    const fromChar = fromSnap.data() as Character;
    console.log("hit222", fromChar);
    // Unattune if its attuned to the source character
    if (fromChar.attunedItemIds.includes(itemId)) {
      const newFromAttuned = fromChar.attunedItemIds.filter(id => id !== itemId);
      transaction.update(fromRef, {
        attunedItemIds: newFromAttuned,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    // Remove from source
    transaction.update(itemRef, {
      ownerId: toRef.id,
      isAttuned: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  if (doLog) {
    console.log(`Transferred item ${itemId} from ${fromCharacterId} to ${toCharacterId}`);
  }

  return true;
}

export async function clear(db: Firestore): Promise<void> {
  const col = db.collection("characters");
  const snapshot = await col.get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export async function exists(db: Firestore, characterId: string): Promise<boolean> {
  const doc = await db.collection("characters").doc(characterId).get();
  return doc.exists;
}

export const characterDao = {
  all,
  attuneItem,
  clear,
  create,
  exists,
  find,
  findByName,
  transferItem,
  unattuneItem,
  update,
}