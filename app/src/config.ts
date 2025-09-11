import dotenv from "dotenv";

dotenv.config();

const { PUBLIC_KEY, APPLICATION_ID, BOT_TOKEN, PORT = "3000" } = process.env

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
if (!PUBLIC_KEY || !APPLICATION_ID || !BOT_TOKEN || !PORT) {
  throw new Error(`Missing environment variables ${errors.join(",")}`);
}

type AppConfig = {
 PUBLIC_KEY: string,
 APPLICATION_ID: string,
 BOT_TOKEN: string,
 PORT: string
}
export const config: AppConfig = {
  PUBLIC_KEY, APPLICATION_ID, BOT_TOKEN, PORT
};
