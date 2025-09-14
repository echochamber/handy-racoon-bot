

import { FieldValue, Firestore } from "firebase-admin/firestore";
import { characterDao } from "./character.js";
import { BaseDoc, docToEntity } from "./docBase.js";

export interface MagicItem extends BaseDoc{
  name: string;
  description: string;
  isAttuned: boolean;
  ownerId?: string;
}


export async function create(db: Firestore, item: MagicItem, doLog?: boolean): Promise<MagicItem> {

  const col = db.collection("magicItems");
  const itemDoc = col.doc();
  if (item.ownerId && item.isAttuned) {
    const attune = characterDao.attuneItem(db, item.ownerId, itemDoc.id);
  }
  const now = FieldValue.serverTimestamp();

  const createI =  itemDoc.set({
    ...item,
    updatedAt: now,
    createdAt: now
  });
  item.meta = { id: itemDoc.id, path: itemDoc.path };
  item.createdAt = now;
  item.updatedAt = now;

  if (doLog) {
    console.log(`MagicItem created with ID: ${itemDoc.id}`);
    console.log(item);
  }

  return item;
}

export async function stashItem(db: Firestore, itemId: string): Promise<void> {
  // Find the item
  const itemDoc = db.collection("magicItems").doc(itemId);
  const itemSnap = await itemDoc.get();
  if (!itemSnap.exists) {
    throw new Error(`MagicItem with id ${itemId} does not exist`);
  }
  const item = docToEntity<MagicItem>(itemSnap);

  // Unattune from existing owner if necessary.
  if (item.ownerId && item.isAttuned) {
    await characterDao.unattuneItem(db, item.ownerId, itemId);
  }

  // Set owner to stash.
  const stashChars = await db.collection("characters").where("name", "==", "Stash").limit(1).get();
  if (stashChars.empty) {
    throw new Error('No character named "Stash" found');
  }
  const stashId = stashChars.docs[0].id;
  await itemDoc.update({
    ownerId: stashId,
    isAttuned: false,
    updatedAt: FieldValue.serverTimestamp()
  });
}

export async function all(db: Firestore) {
  try {
    const collection = await db.collection("magicItems").get();

    return collection.docs.map((doc) => docToEntity<MagicItem>(doc));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function find(db: Firestore, id: string) {
  try {
    const d = await db.collection("magicItems").doc(id).get();
    return docToEntity<MagicItem>(d);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function findByCharacter(db: Firestore, playerId: string): Promise<MagicItem[]> {
  try {
    const snapshot = await db.collection("magicItems")
      .where("ownerId", "==", playerId)
      .get();

    return snapshot.docs.map(doc => docToEntity<MagicItem>(doc));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function update(db: Firestore, item: MagicItem): Promise<MagicItem> {
  if (!item.meta?.id) {
    throw new Error("MagicItem must have a meta.id to update");
  }
  const docRef = db.collection("magicItems").doc(item.meta.id);
  const now = FieldValue.serverTimestamp();

  await docRef.update({
    ...item,
    updatedAt: now
  });

  item.updatedAt = now;
  return item;
}

export async function findByIds(db: Firestore, ids: string[]): Promise<MagicItem[]> {
  if (!ids.length) return [];
  const col = db.collection("magicItems");
  const snapshots = await Promise.all(ids.map(id => col.doc(id).get()));
  return snapshots
    .filter(snap => snap.exists)
    .map(snap => docToEntity<MagicItem>(snap));
}

export async function clear(db: Firestore): Promise<void> {
  const col = db.collection("magicItems");
  const snapshot = await col.get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export const magicItemDao = {
  create,
  find,
  all,
  findByCharacter,
  findByIds,
  update,
  clear
};

