import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let analyticsPromise: Promise<Analytics | undefined> | null = null;

if (projectId && apiKey && appId) {
  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

/**
 * Initialise Firebase Analytics on demand. MUST only be called after the user
 * has granted cookie consent — getAnalytics() sets Google Analytics cookies
 * (_ga, _ga_*) and uses Firebase installation identifiers. Idempotent.
 */
export async function enableAnalytics(): Promise<Analytics | undefined> {
  if (analytics) return analytics;
  if (!app || typeof window === "undefined") return undefined;
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => {
      if (supported && app) analytics = getAnalytics(app);
      return analytics;
    });
  }
  return analyticsPromise;
}

/** Already-initialised analytics instance, if any. */
export function getAnalyticsInstance(): Analytics | undefined {
  return analytics;
}

export { app, analytics };