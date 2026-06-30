// lib/firebase.ts
//
// Configuration centralisée Firebase — à importer partout où l'on a
// besoin de l'authentification ou de Firestore.
//
// Installer d'abord : npm install firebase

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACjNRhsJ-2BTcmjCldlNoqPQzun-Y3ZgY",
  authDomain: "drone-uav-571e9.firebaseapp.com",
  projectId: "drone-uav-571e9",
  storageBucket: "drone-uav-571e9.firebasestorage.app",
  messagingSenderId: "247280227175",
  appId: "1:247280227175:web:65203523bf7ae983e9d5c2",
};

// `getApps()` évite de réinitialiser Firebase plusieurs fois lors du
// hot-reload de Next.js en développement.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;