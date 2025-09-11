import dotenv from "dotenv";

dotenv.config();

export interface ConstantsInterface {
  [key: string]: { [key: string]: string };
}

export const constants: ConstantsInterface = {
  RUNTIME_ENV: {
    LOCAL: "LOCAL",
    CLOUD_FUNCTIONS: "CLOUD_FUNCTIONS"
  }
};

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} = process.env

const firebaseErrors: string[] = [];
if (!FIREBASE_API_KEY) firebaseErrors.push("FIREBASE_API_KEY");
if (!FIREBASE_AUTH_DOMAIN) firebaseErrors.push("FIREBASE_AUTH_DOMAIN");
if (!FIREBASE_PROJECT_ID) firebaseErrors.push("FIREBASE_PROJECT_ID");
if (!FIREBASE_STORAGE_BUCKET) firebaseErrors.push("FIREBASE_STORAGE_BUCKET");
if (!FIREBASE_MESSAGING_SENDER_ID) firebaseErrors.push("FIREBASE_MESSAGING_SENDER_ID");
if (!FIREBASE_APP_ID) firebaseErrors.push("FIREBASE_APP_ID");
if (!FIREBASE_MEASUREMENT_ID) firebaseErrors.push("FIREBASE_MEASUREMENT_ID");
if (firebaseErrors.length) {
  throw new Error(`Missing Firebase environment variables: ${firebaseErrors.join(", ")}`);
}

export const firebase: FirebaseConfig = {
  apiKey: FIREBASE_API_KEY!,
  authDomain: FIREBASE_AUTH_DOMAIN!,
  projectId: FIREBASE_PROJECT_ID!,
  storageBucket: FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID!,
  appId: FIREBASE_APP_ID!,
  measurementId: FIREBASE_MEASUREMENT_ID!
}

const { PUBLIC_KEY, APPLICATION_ID, BOT_TOKEN, RUNTIME_ENV, PORT = "3000" } = process.env

var errors: string[] = []
if (!PUBLIC_KEY) {
  errors.push("PUBLIC_KEY")
}
if (!APPLICATION_ID) {
  errors.push("APPLICATION_ID")
}
if (!BOT_TOKEN) {
  errors.push("BOT_TOKEN")
}
if (errors.length) {
  throw new Error(`Missing environment variables ${errors.join(",")}`);
}
if (!PUBLIC_KEY || !APPLICATION_ID || !BOT_TOKEN || !PORT || !RUNTIME_ENV) {
  throw new Error(`Missing environment variables ${errors.join(",")}`);
}

export interface AppConfig {
 PUBLIC_KEY: string,
 APPLICATION_ID: string,
 BOT_TOKEN: string,
 PORT: string,
 RUNTIME_ENV: string
}
export const config: AppConfig = {
  PUBLIC_KEY, APPLICATION_ID, BOT_TOKEN, PORT, RUNTIME_ENV
};
