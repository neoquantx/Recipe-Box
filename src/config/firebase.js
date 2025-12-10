import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Helper to read configuration from process.env or Expo's config extras
const getConfigValue = (key) => {
	// process.env values (expo starts with these), then expoConfig.extra, then legacy manifest
	if (process.env[key]) return process.env[key];
	const expoExtra = Constants.expoConfig?.extra || Constants.manifest?.extra;
	if (expoExtra && Object.prototype.hasOwnProperty.call(expoExtra, key)) return expoExtra[key];
	return null;
};

const firebaseConfig = {
	apiKey: getConfigValue("EXPO_PUBLIC_FIREBASE_API_KEY"),
	authDomain: getConfigValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
	projectId: getConfigValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
	storageBucket: getConfigValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: getConfigValue("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
	appId: getConfigValue("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

// Fail early and provide a clear message if apiKey is missing
if (!firebaseConfig.apiKey) {
	// eslint-disable-next-line no-console
	console.error("Firebase apiKey is missing. Set EXPO_PUBLIC_FIREBASE_API_KEY in .env, app.config.js (expo.extra), or your build environment.");
	throw new Error(
		"Missing Firebase apiKey. Set EXPO_PUBLIC_FIREBASE_API_KEY in .env, app.config.js (expo.extra), or your build environment and restart the bundler."
	);
}

// Initialize Firebase app (singleton)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default app;
