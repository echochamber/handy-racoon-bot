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

const {
  PUBLIC_KEY,
  APPLICATION_ID,
  BOT_TOKEN,
  RUNTIME_ENV,
  FIREBASE_APP,
  FIREBASE_DB = 'handy-racoon',
  PORT = "3000"
} = process.env
const GCP_PROJECT = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;


var errors: string[] = []
const REQUIRED = ['PUBLIC_KEY', 'APPLICATION_ID', 'BOT_TOKEN', 'PORT', 'RUNTIME_ENV', 'FIREBASE_DB', 'GCP_PROJECT', 'FIREBASE_APP']
REQUIRED.forEach((key) => {
  if (!process.env[key]) {
    errors.push(key);
  }
});
if (errors.length) {
  throw new Error(`Missing environment variables ${errors.join(",")}`);
}

export interface AppConfig {
 publicKey: string,
 applicationId: string,
 botToken: string,
 port: string,
 runtimeEnv: string,
 firebaseDb: string,
 gcpProject: string,
 firebaseApp: string
}
export const config: AppConfig = {
  publicKey: PUBLIC_KEY!,
  applicationId: APPLICATION_ID!,
  botToken: BOT_TOKEN!,
  port: PORT!,
  runtimeEnv: RUNTIME_ENV!,
  firebaseDb: FIREBASE_DB!,
  gcpProject: GCP_PROJECT!,
  firebaseApp: FIREBASE_APP!
};
