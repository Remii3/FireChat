import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import "firebase/auth";
import "firebase/firestore";

export const app = initializeApp({
  apiKey: "AIzaSyDsV3B3yR_VocQN-e6Jt9TIBbUOrRtwXOI",
  authDomain: "firechat-7bc9e.firebaseapp.com",
  projectId: "firechat-7bc9e",
  storageBucket: "firechat-7bc9e.appspot.com",
  messagingSenderId: "324351477931",
  appId: "1:324351477931:web:9d1109927adb65ce920fee",
});

export const auth = getAuth(app);
export const firestore = getFirestore(app);
