// src/firebase.ts
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { config} from "../config.js";

export const fbApp = initializeApp(
    {
      projectId: config.gcpProject,
      credential: applicationDefault(),
    },
    config.firebaseApp
  );

export const db: Firestore = getFirestore(fbApp, config.firebaseDb);
db.settings({ ignoreUndefinedProperties: true });