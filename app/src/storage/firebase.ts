import { firebase, config } from "../config.js";

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from "firebase-admin/firestore";


export function init() {
  const fbApp = initializeApp(firebase);
  return fbApp;
}

export const db: Firestore = getFirestore(init(), config.FIREBASE_DB);