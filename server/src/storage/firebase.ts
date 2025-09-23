// src/firebase.ts
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { config} from "../config.js";

export const fbApp = initializeApp(
    {
      projectId: config.GCP_PROJECT,
      credential: applicationDefault(),
    },
    config.FIREBASE_APP
  );

export const db: Firestore = getFirestore(fbApp, config.FIREBASE_DB);
db.settings({ ignoreUndefinedProperties: true });