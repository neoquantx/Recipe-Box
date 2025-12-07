// app.config.js — dynamic Expo config that loads env variables at build-time.
// This keeps secrets out of VCS if you define them in a local `.env` file and add that to .gitignore.
const { config: dotenvConfig } = require("dotenv");
// Load .env locally (only if it exists); EAS or CI should inject env variables separately.
dotenvConfig({ path: process.env.DOTENV_PATH || ".env" });

export default ({ config }) => {
  // Keep any existing extra values from app.json but prefer env values for firebase.
  return {
    ...config,
    extra: {
      ...config.extra,
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId:
          process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
      },
    },
  };
};
