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

export interface AppConfig {
  PUBLIC_KEY: string,
  APPLICATION_ID: string,
  BOT_TOKEN: string,
  PORT: string,
  RUNTIME_ENV: string,
  FIREBASE_DB: string,
  GCP_PROJECT: string,
  FIREBASE_APP: string,
  OAUTH_CLIENT_ID: string,
  OAUTH_CLIENT_SECRET: string,
  OAUTH_REDIRECT_URI: string
}

const {
  PUBLIC_KEY,
  APPLICATION_ID,
  BOT_TOKEN,
  RUNTIME_ENV,
  FIREBASE_APP,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  GCP_PROJECT = "",
  GCLOUD_PROJECT = "",
  FIREBASE_DB = 'handy-racoon',
  PORT = "3000"
} = process.env


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
export const config: AppConfig = {
  PUBLIC_KEY: PUBLIC_KEY!,
  APPLICATION_ID: APPLICATION_ID!,
  BOT_TOKEN: BOT_TOKEN!,
  PORT: PORT!,
  RUNTIME_ENV: RUNTIME_ENV!,
  FIREBASE_DB: FIREBASE_DB!,
  GCP_PROJECT: GCP_PROJECT || GCLOUD_PROJECT,
  FIREBASE_APP: FIREBASE_APP!,
  OAUTH_CLIENT_ID: OAUTH_CLIENT_ID!,
  OAUTH_CLIENT_SECRET: OAUTH_CLIENT_SECRET!,
  OAUTH_REDIRECT_URI: OAUTH_REDIRECT_URI!
};
