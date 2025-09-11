import type { DocumentReference, Firestore, WriteResult } from '@google-cloud/firestore'; // adjust import if needed

export async function tryIt(db: Firestore): Promise<[WriteResult, WriteResult]> {
  const docRef: DocumentReference = db.collection('users').doc('alovelace');

  const v1Promise: Promise<WriteResult> = docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
  });

  const aTuringRef: DocumentReference = db.collection('users').doc('aturing');

  const v2Promise: Promise<WriteResult> = aTuringRef.set({
    first: 'Alan',
    middle: 'Mathison',
    last: 'Turing',
    born: 1912
  });

  return Promise.all([v1Promise, v2Promise]);
}

export async function tryIt2(db: Firestore): Promise<WriteResult> {
  const docRef: DocumentReference = db.collection('users').doc('alovelace');

  return docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
  });
}

export async function tryIt3(db: Firestore) {
  const docRef = await db.collection('players').doc('example').get();

  await db.collection('players').doc('example2').set(
    { id: 'example_2', discorduser: 'discordUser123547', alias: 'Display Name Person' }
  );
  const result = { id: docRef.id, ...docRef.data() };
  console.log(result);
  return 
}